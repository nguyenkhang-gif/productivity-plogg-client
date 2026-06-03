# React Query Migration Guide

## Tại sao refactor?

Codebase cũ dùng sai pattern: React Query fetch data rồi **dispatch vào Redux**, component đọc từ Redux qua `useSelector`. Kết quả là data server bị cache ở **2 nơi đồng thời** (RQ cache + Redux store), tạo ra dual source of truth dễ desync.

```
# Pattern cũ (SAI)
API → React Query (fetch) → dispatch to Redux → component useSelector(state.post.posts)
                              ↑ dư thừa, dễ stale

# Pattern mới (ĐÚNG)
API → React Query (fetch + cache) → component đọc từ query hook
Redux chỉ giữ UI state thuần: auth, modal open/close, typing indicator, upload provider
```

---

## Phân loại state

### Giữ trong Redux
| Slice | Fields | Lý do |
|---|---|---|
| `user` | profile, token, isAuth, isLoading | Auth gate — dùng khắp app trước mọi request |
| `chat` | activeConversationId, isOpen, typing | Pure UI interaction state |
| `chat` | conversations, messages | WebSocket data — giữ tạm, refactor riêng sau |
| `upload` | provider | UI preference, persist sang localStorage |
| `aiChat` | toàn bộ | Local-only AI conversation, không sync server |
| `epub` | toàn bộ | Chapter builder state, local-only |

### Đã chuyển sang React Query
| Data | Query Key (FetchQueryKeys enum) | Hook |
|---|---|---|
| Post feed (infinite) | `POST_GET_ALL` | `useGetPostsFeed()` |
| Single post | `POST_GET_BY_ID` | `useGetPostById(id)` |
| Posts by author (infinite) | `POST_GET_BY_AUTHOR` | `useGetPostsByAuthor(authorId)` |
| Comments của post (infinite) | `COMMENT_GET_BY_POST` | `useGetComments(postId)` |
| Friends list | `FRIENDS` | `useGetFriends()` |
| Received friend requests | `FRIENDSHIP_RECEIVED` | `useGetReceivedRequests()` |
| Sent friend requests | `FRIENDSHIP_SENT` | `useGetSentRequests()` |

### Đã xóa khỏi Redux
| Slice đã xóa | Lý do |
|---|---|
| `post` (posts[], hasMore, selectedPost) | Hoàn toàn là server cache |
| `comment` (byPostId, hasMoreByPostId) | Hoàn toàn là server cache |
| `friendship` (friends[], received[], sent[]) | Fetch từ API, không có UI-only logic |

---

## Patterns

### 1. Đọc data từ Infinite Query

```ts
// TRƯỚC (đọc từ Redux)
const { posts, hasMore } = useSelector((state: RootState) => state.post)

// SAU (đọc từ React Query)
const { data, isLoading, fetchNextPage, isFetchingNextPage } = useGetPostsFeed()
const posts = data?.pages.flatMap(p => p.posts) ?? []
const hasMore = data?.pages.at(-1)?.hasMore ?? true
```

### 2. Query hook — KHÔNG dispatch vào Redux

```ts
// TRƯỚC
queryFn: async ({ pageParam }) => {
  const data = await apiGetPosts(pageParam, limit)
  dispatch(appendPosts({ posts, hasMore }))   // ← XÓA
  return { posts, hasMore, page: pageParam }
}

// SAU
queryFn: async ({ pageParam }) => {
  const data = await apiGetPosts(pageParam, limit)
  // React Query tự cache — không cần dispatch
  return { posts, hasMore, page: pageParam }
}
```

### 3. Mutation update — dùng setQueryData thay vì dispatch

```ts
// TRƯỚC
onSuccess: (data) => {
  dispatch(updatePost(data))
  queryClient.invalidateQueries([POST_GET_ALL])
}

// SAU — patch trực tiếp vào RQ infinite cache
onSuccess: (updatedPost) => {
  queryClient.setQueryData(
    [FetchQueryKeys.POST_GET_ALL],
    (old: InfiniteData<PageResult> | undefined) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          posts: page.posts.map(p => p.id === updatedPost.id ? updatedPost : p)
        }))
      }
    }
  )
}
```

### 4. Mutation delete — filter khỏi cache

```ts
onSuccess: (_, deletedId) => {
  queryClient.setQueryData(
    [FetchQueryKeys.POST_GET_ALL],
    (old: InfiniteData<PageResult> | undefined) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          posts: page.posts.filter(p => p.id !== deletedId)
        }))
      }
    }
  )
}
```

### 5. Optimistic Update đúng cách — dùng onMutate

```ts
// TRƯỚC — optimistic qua Redux dispatch (trước khi gọi API)
dispatch(reactPost({ postId, reaction: { type }, reactCount: prevCount + 1 }))
react({ postId, type, prevReaction, prevCount })

// SAU — optimistic qua RQ onMutate / onError / onSettled
useMutation({
  mutationFn: ({ postId, type }) => apiReactPost(postId, type),

  onMutate: async ({ postId, type }) => {
    // 1. Cancel pending refetches để tránh overwrite optimistic update
    await queryClient.cancelQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] })
    
    // 2. Lưu snapshot để rollback nếu lỗi
    const snapshot = queryClient.getQueryData([FetchQueryKeys.POST_GET_ALL])

    // 3. Cập nhật cache optimistically
    queryClient.setQueryData([FetchQueryKeys.POST_GET_ALL], (old) => ({
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        posts: page.posts.map(p => {
          if (p.id !== postId) return p
          const isToggleOff = p.userReaction?.type === type
          return {
            ...p,
            userReaction: isToggleOff ? null : { type },
            reactCount: isToggleOff
              ? Math.max(0, p.reactCount - 1)
              : p.userReaction ? p.reactCount : p.reactCount + 1,
          }
        })
      }))
    }))

    return { snapshot }  // trả về context để dùng trong onError
  },

  onError: (_, __, context) => {
    // Rollback về snapshot trước đó
    queryClient.setQueryData([FetchQueryKeys.POST_GET_ALL], context?.snapshot)
  },

  onSettled: () => {
    // Sync lại với server sau khi mutation xong (dù success hay error)
    queryClient.invalidateQueries({ queryKey: [FetchQueryKeys.POST_GET_ALL] })
  },
})
```

### 6. Mutation create comment — prepend vào page đầu tiên

```ts
onSuccess: (newComment) => {
  queryClient.setQueryData(
    [FetchQueryKeys.COMMENT_GET_BY_POST, postId],
    (old: InfiniteData<PageResult> | undefined) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0
            ? { ...page, comments: [newComment, ...page.comments] }
            : page
        )
      }
    }
  )
}
```

---

## Query Keys (canonical)

Tất cả query key **phải dùng** `FetchQueryKeys` enum từ `src/core/services/endpoints.ts`.
Không dùng string literal — dùng enum để tránh typo và dễ tìm kiếm.

```ts
// src/core/services/endpoints.ts
export enum FetchQueryKeys {
  EPUB_GET_USER_EPUB = "EPUB_GET_USER_EPUB",

  POST_GET_ALL = "POST_GET_ALL",
  POST_GET_BY_ID = "POST_GET_BY_ID",
  POST_GET_BY_AUTHOR = "POST_GET_BY_AUTHOR",

  COMMENT_GET_BY_POST = "COMMENT_GET_BY_POST",

  // Friendship
  FRIENDS = "FRIENDS",
  FRIENDSHIP_RECEIVED = "FRIENDSHIP_RECEIVED",
  FRIENDSHIP_SENT = "FRIENDSHIP_SENT",
}
```

---

## Redux Store sau refactor

```ts
// src/core/redux/store.ts
const store = configureStore({
  reducer: {
    user: userReducer,         // auth state
    chat: chatReducer,         // socket UI state (open/close, typing, conversations)
    aiChat: aiChatReducer,     // local AI conversation history
    upload: uploadReducer,     // provider preference ("default" | "cloudinary")
    chapters: chapterReducer,  // epub chapter builder state
  },
})
// Đã xóa: post, comment, friendship
```

---

## Types

Các interface không còn nằm trong Redux slices. Vị trí mới:

| Type | File mới |
|---|---|
| `Post`, `PostAuthor`, `ReactionType`, `UserReaction` | `src/core/types/post.ts` |
| `Comment`, `CommentAuthor` | `src/core/types/comment.ts` |
| `Friendship`, `FriendInfo`, `FriendshipStatus` | `src/core/types/friendship.ts` (đã có sẵn) |

---

## Lưu ý khi thêm feature mới

1. **Không dispatch server data vào Redux.** Chỉ `setQueryData` hoặc `invalidateQueries`.
2. **Dùng `onMutate` cho optimistic updates** — không dispatch Redux trước khi API trả về.
3. **Query keys phải là enum** — thêm vào `FetchQueryKeys` trong `services/endpoints.ts`.
4. **`staleTime`** — mặc định 60s (config trong `plugins/reactQuery.ts`). Override per-query nếu cần data fresh hơn.
5. **Friendship queries** dùng `enabled: isAuth` — không fetch khi chưa login.
