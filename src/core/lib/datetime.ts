import moment from "moment";
import "moment/locale/vi";

// Set locale once for the whole app (side-effect of importing this module).
moment.locale("vi");

/** Giờ:phút, vd "14:30" */
export const formatTime = (date: string | Date) => moment(date).format("HH:mm");

/** Ngày/tháng/năm, vd "28/07/2026" */
export const formatDate = (date: string | Date) => moment(date).format("DD/MM/YYYY");

/** Ngày + giờ, vd "28/07/2026 14:30" */
export const formatDateTime = (date: string | Date) =>
  moment(date).format("DD/MM/YYYY HH:mm");

/** Tương đối, vd "5 phút trước" */
export const fromNow = (date: string | Date) => moment(date).fromNow();

/** Lịch tương đối, vd "Hôm nay lúc 14:30" — hợp cho separator ngày trong chat */
export const formatCalendar = (date: string | Date) => moment(date).calendar();

/** true nếu 2 mốc cùng ngày — dùng để nhóm message theo ngày */
export const isSameDay = (a: string | Date, b: string | Date) =>
  moment(a).isSame(b, "day");
