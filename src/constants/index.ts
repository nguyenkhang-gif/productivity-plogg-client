// constants.ts
import { Home, Calendar, History } from "lucide-react";

export const sideBarLinks = [
  {
    label: "Home",
    route: "/home",
    icon: Home
  },
  {
    label: "Upcoming",
    route: "/upcoming",
    icon: Calendar
  },
  {
    label: "Previous",
    route: "/previous",
    icon: History
  }
];
