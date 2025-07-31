import {TbMountain, TbPool } from "react-icons/tb";
import {
  GiBoatFishing,
  GiForestCamp,
  GiVillage,
  GiRiver
} from "react-icons/gi";
import { LiaMountainSolid } from "react-icons/lia";
import {
  FaFireExtinguisher,
  FaKey,
} from "react-icons/fa";
import { FaHouseUser, FaPeopleRoof } from "react-icons/fa6";
import { RiAncientGateFill } from "react-icons/ri";
import {
  BiSolidWasher,
  BiSolidDryer,
  BiSolidFirstAid,
  BiWifi,
  BiSolidFridge,
  BiWorld,
} from "react-icons/bi";
import { BsSnow, BsFillDoorOpenFill, BsPersonWorkspace } from "react-icons/bs";
import { IoDiamond } from "react-icons/io5";
import {  MdOutlineVilla,MdMicrowave, MdBalcony,  MdPets } from "react-icons/md";
import {
  PiBathtubFill,
  
  PiTelevisionFill,
} from "react-icons/pi";
import {
  GiHeatHaze,
  GiCctvCamera,
  GiToaster,
  GiCampfire,
} from "react-icons/gi";
import { AiFillCar } from "react-icons/ai";

export const categories = [
  {
    label: "All",
    icon: <BiWorld />,
  },
  {
    img: "assets/riverside.jpg",
    label: "Riverside",
    icon: <GiRiver />,
    description: "This property is close to the River!",
  },
  {
    img: "assets/mountain.jpg",
    label: "Mountains",
    icon: <LiaMountainSolid />,
    description: "This property is has windmills!",
  },
  {
    img: "assets/historical.jpg",
    label: "Historical cities",
    icon: <RiAncientGateFill />,
    description: "This property is historical!",
  },
  {
    img: "assets/village.jpg",
    label: "Village",
    icon: <GiVillage />,
    description: "This property is in the countryside!",
  },
  {
    img: "assets/pool_cat.jpg",
    label: "Amazing Pools",
    icon: <TbPool />,
    description: "This is property has a beautiful pool!",
  },
  {
    img: "assets/hill.png",
    label: "Hills",
    icon: <TbMountain />,
    description: "This property is on a hill!",
  },
  {
    img: "assets/lake_cat.webp",
    label: "Lakefront",
    icon: <GiBoatFishing />,
    description: "This property is near a lake!",
  },
  {
    img: "assets/forest.jpg",
    label: "Forest",
    icon: <GiForestCamp />,
    description: "This property is in Forest!",
  },
  {
    img: "assets/iconic.webp",
    label: "Iconic cities",
    icon: <MdOutlineVilla />,
    description: "This property is modern!",
  },
  {
    img: "assets/lux_cat.jpg",
    label: "Luxury",
    icon: <IoDiamond />,
    description: "This property is brand new and luxurious!",
  },
];

export const types = [
  {
    name: "An entire place",
    description: "Guests have the whole place to themselves",
    icon: <FaHouseUser />,
  },
  {
    name: "Room(s)",
    description:
      "Guests have their own room in a house, plus access to shared places",
    icon: <BsFillDoorOpenFill />,
  },
  {
    name: "A Shared Room",
    description:
      "Guests sleep in a room or common area that maybe shared with you or others",
    icon: <FaPeopleRoof />,
  },
];

export const facilities = [
  {
    name: "Bath tub",
    icon: <PiBathtubFill />,
  },

  {
    name: "Washer",
    icon: <BiSolidWasher />,
  },
  
 
  {
    name: "TV",
    icon: <PiTelevisionFill />,
  },
  {
    name: "Dedicated workspace",
    icon: <BsPersonWorkspace />
  },
  {
    name: "Air Conditioning",
    icon: <BsSnow />,
  },
  {
    name: "Heater",
    icon: <GiHeatHaze />,
  },
  {
    name: "Security cameras",
    icon: <GiCctvCamera />,
  },
  {
    name: "Fire extinguisher",
    icon: <FaFireExtinguisher />,
  },
  {
    name: "First Aid",
    icon: <BiSolidFirstAid />,
  },
  {
    name: "Wifi",
    icon: <BiWifi />,
  },
 
  {
    name: "Refrigerator",
    icon: <BiSolidFridge />,
  },
  {
    name: "Microwave",
    icon: <MdMicrowave />,
  },
  {
    name: "Stove",
    icon: <GiToaster />,
  },
  {
    name: "Private patio or Balcony",
    icon: <MdBalcony />,
  },
  {
    name: "Camp fire",
    icon: <GiCampfire />,
  },
  {
    name: "Free parking",
    icon: <AiFillCar />,
  },
  {
    name: "Self check-in",
    icon: <FaKey />
  },
  {
    name: " Pet allowed",
    icon: <MdPets />
  }
];
