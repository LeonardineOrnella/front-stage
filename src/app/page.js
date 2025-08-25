import CardFormation from "@/components/frontOffice/acceuil/CardFormation";
import Home from "@/components/frontOffice/acceuil/Home";
import Header from "@/components/frontOffice/Header";
import Image from "next/image";

export default function Acceuil() {
  return (
    <div className="">

      <Header />
      <Home />
      <CardFormation />

    </div>
  );
}
