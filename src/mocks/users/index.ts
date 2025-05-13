/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IUser } from "../../pages/users/interface";
import { rolesMock } from "../settings";

export const usersMock: IUser[] = [
    {
        id: 1,
        staffNumber: 'SN001',
        firstName: 'John',
        lastName: 'Doe',
        otherName: 'Michael',
        name: "",
        email: 'john.doe@example.com',
        reportsTo: 'Jane Smith',
        title: 'Software Engineer',
        department: 'Business Technology',
        unit: 'Backend',
        gender: 'Male',
        image: "image",
        availability: "present",
        role: rolesMock[0]
    }
];


/*

[
  {
    "password": "Alican@1990",
    "address": "Kampala",
    "phone": "+256701112233",
    "lastName": "Alican",
    "firstName": "Amulla",
    "email": "sodong@pridebank.co.ug"
  },
  {
    "password": "Luna@1992",
    "address": "Entebbe",
    "phone": "+256702223344",
    "lastName": "Kiggundu",
    "firstName": "Luna",
    "email": "luna.k@pridebank.co.ug"
  },
  {
    "password": "Nambi@2020",
    "address": "Jinja",
    "phone": "+256703334455",
    "lastName": "Nambi",
    "firstName": "Grace",
    "email": "grace.nambi@pridebank.co.ug"
  },
  {
    "password": "Moses@1985",
    "address": "Mbale",
    "phone": "+256704445566",
    "lastName": "Okello",
    "firstName": "Moses",
    "email": "moses.okello@pridebank.co.ug"
  },
  {
    "password": "Sarah@1989",
    "address": "Gulu",
    "phone": "+256705556677",
    "lastName": "Auma",
    "firstName": "Sarah",
    "email": "sarah.auma@pridebank.co.ug"
  },
  {
    "password": "Brian@1993",
    "address": "Mbarara",
    "phone": "+256706667788",
    "lastName": "Mukasa",
    "firstName": "Brian",
    "email": "brian.mukasa@pridebank.co.ug"
  },
  {
    "password": "Helen@1991",
    "address": "Fort Portal",
    "phone": "+256707778899",
    "lastName": "Kabonesa",
    "firstName": "Helen",
    "email": "helen.k@pridebank.co.ug"
  },
  {
    "password": "Peter@1988",
    "address": "Lira",
    "phone": "+256708889900",
    "lastName": "Ocen",
    "firstName": "Peter",
    "email": "peter.ocen@pridebank.co.ug"
  },
  {
    "password": "Jolly@2000",
    "address": "Masaka",
    "phone": "+256709990011",
    "lastName": "Nakitende",
    "firstName": "Jolly",
    "email": "jolly.n@pridebank.co.ug"
  },
  {
    "password": "Emma@1994",
    "address": "Kampala",
    "phone": "+256710101112",
    "lastName": "Musoke",
    "firstName": "Emma",
    "email": "emma.musoke@pridebank.co.ug"
  },
  {
    "password": "Denis@1995",
    "address": "Soroti",
    "phone": "+256711212223",
    "lastName": "Odongo",
    "firstName": "Denis",
    "email": "denis.odongo@pridebank.co.ug"
  },
  {
    "password": "Betty@1996",
    "address": "Kiboga",
    "phone": "+256712323334",
    "lastName": "Balaba",
    "firstName": "Betty",
    "email": "betty.b@pridebank.co.ug"
  },
  {
    "password": "Allan@1997",
    "address": "Hoima",
    "phone": "+256713434445",
    "lastName": "Tumusiime",
    "firstName": "Allan",
    "email": "allan.tumusiime@pridebank.co.ug"
  },
  {
    "password": "Faith@1998",
    "address": "Mityana",
    "phone": "+256714545556",
    "lastName": "Kasirye",
    "firstName": "Faith",
    "email": "faith.k@pridebank.co.ug"
  },
  {
    "password": "Zoe@1999",
    "address": "Iganga",
    "phone": "+256715656667",
    "lastName": "Namugga",
    "firstName": "Zoe",
    "email": "zoe.namugga@pridebank.co.ug"
  }
]

*/