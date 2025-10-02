"use client";
import PortfolioUserOverview from "@/components/portfolio/PortfolioUserOverview";
import AboutMeSection from "@/components/portfolio/AboutMeSection";
const tempUserPropData = {
  avatar:
    "https://storage.googleapis.com/productivity-blog-a.appspot.com/files%2Fprofile.jpg",
  name: "Khang",
  desciptions:
    "A full-stack developer with hands-on experience in modern JavaScript frameworks. Passionate about delivering scalable and intuitive user experiences. I’m always eager to adapt to new technologies and master them as quickly as possible. Seeking to join a dynamic team where I can grow my technical expertise and contribute to impactful software solutions.",
  location: "Ho Chi Minh City, Viet Nam",
  status: "ready",
  positions: "Developer at IES",
};

const aboutMePropsData = {
  description: "wowkdklajdlkasjlkdjalskjd",
  imgUrl:
    "https://storage.googleapis.com/productivity-blog-a.appspot.com/files%2Ftanaka-kun-english-dub-cast-list.png",
};

export default function Page() {
  // const { id } = useParams<{ id: string }>();
  // const user = useSelector((data: RootState) => data.user);

  return (
    <div className="w-full">
      <PortfolioUserOverview user={tempUserPropData} />
      <AboutMeSection
        descriptions={aboutMePropsData.description}
        imgUrl={aboutMePropsData.imgUrl}
      />
      <section>User About me</section>
      <section>Skills</section>
      <section>Experience</section>
    </div>
  );
}
