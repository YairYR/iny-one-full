import HomeTitle from "@/components/HomeTitle";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import UtmInfoSmall from "@/components/UtmInfoSmall";

export default function HomePage() {
  return (
    <>
      <HomeTitle />
      <UrlShortForm />
      <UtmInfoSmall />
    </>
  );
}