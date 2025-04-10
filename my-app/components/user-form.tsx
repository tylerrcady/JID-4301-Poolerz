"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddModal from "@/components/modals/add-modal";

// fade-in effect
const fadeInAnimation = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

interface UserLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UserFormData {
  location: UserLocation;
  phoneNumber: string;
  children: { name: string; age: string }[];
  numChildren: number;
}

interface FormErrors {
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  phoneNumber?: string;
  children?: { name?: string; age?: string }[];
}

interface UserFormProps {
  userId: string | undefined;
}

export default function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const [formStep, setFormStep] = useState(1);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [selectedChildCount, setSelectedChildCount] = useState(0);
  const [childrenAnimatingOut, setChildrenAnimatingOut] = useState<number[]>([]);

  const [userFormData, setUserFormData] = useState<UserFormData>({
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    phoneNumber: "",
    children: [],
    numChildren: 0
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    let newProgress = 0;
    
    if (formStep === 1) {
      const totalFields = 5;
      let filledFields = 0;
      
      if (userFormData.location.address.trim()) filledFields++;
      if (userFormData.location.city.trim()) filledFields++;
      if (userFormData.location.state.trim()) filledFields++;
      if (userFormData.location.zipCode.trim()) filledFields++;
      if (userFormData.phoneNumber.trim()) filledFields++;
      
      newProgress = Math.round((filledFields / totalFields) * 50);
    } else if (formStep === 2) {
      newProgress = 50;
      
      if (selectedChildCount > 0) {
        // Count filled child name fields
        const filledChildFields = userFormData.children.filter(child => 
          child && child.name && child.name.trim() !== ""
        ).length;
        
        if (selectedChildCount > 0) {
          const childProgress = (filledChildFields / selectedChildCount) * 50;
          newProgress += childProgress;
        }
      }
    }
    
    setProgressValue(newProgress);
  }, [userFormData, formStep, selectedChildCount]);

  const handleUserFormPost = async () => {
    try {
      const response = await fetch("/api/user-form-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userFormData: {
            location: userFormData.location,
            phoneNumber: userFormData.phoneNumber,
            children: userFormData.children,
            numChildren: userFormData.numChildren
          },
        }),
      });
      if (!response.ok) {
        console.error("Failed to submit form:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  function updateLocationField(field: keyof UserLocation, value: string) {
    setUserFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  }

  function updatePhoneNumber(value: string) {
    const formattedValue = value.replace(/[^\d\(\)\s-]/g, '');
    setUserFormData((prev) => ({ ...prev, phoneNumber: formattedValue }));
  }

  function handleStateChange(value: string) {
    const lettersOnly = value.replace(/[^A-Za-z]/g, '');
    
    const formattedValue = lettersOnly.slice(0, 2).toUpperCase();
    
    updateLocationField("state", formattedValue);
  }
  
  function handleZipChange(value: string) {
    const formattedValue = value.replace(/\D/g, '').slice(0, 5);
    updateLocationField("zipCode", formattedValue);
  }

  function addChild(name: string, age: string) {
    setUserFormData((prev) => ({
      ...prev,
      children: [...prev.children, { name, age }],
      numChildren: prev.children.length + 1
    }));
  }

  function handleAddChild() {
    if (newChildName.trim() === "" || newChildAge.trim() === "") {
      return;
    }
    
    addChild(newChildName, newChildAge);
    setNewChildName("");
    setNewChildAge("");
    setIsChildModalOpen(false);
  }

  const handleAddNewChild = () => {
    setSelectedChildCount(prev => prev + 1);
    setUserFormData(prev => ({
      ...prev,
      numChildren: prev.numChildren + 1
    }));
  };
  
  const handleRemoveChild = (indexToRemove: number) => {
    setChildrenAnimatingOut(prev => [...prev, indexToRemove]);
    
    setTimeout(() => {
      const updatedChildren = userFormData.children.filter((_, index) => index !== indexToRemove);
      
      setSelectedChildCount(prev => prev - 1);
      setUserFormData(prev => ({
        ...prev,
        children: updatedChildren,
        numChildren: updatedChildren.length
      }));
      
      setChildrenAnimatingOut(prev => prev.filter(index => index !== indexToRemove));
    }, 300);
  };

  const handleChildCountChange = (count: number) => {
    const prevCount = selectedChildCount;
    
    if (count < prevCount) {
      const animatingOut = [];
      for (let i = count; i < prevCount; i++) {
        animatingOut.push(i);
      }
      setChildrenAnimatingOut(animatingOut);
      
      setTimeout(() => {
        setSelectedChildCount(count);
        setUserFormData(prev => ({
          ...prev,
          children: prev.children.slice(0, count),
          numChildren: count
        }));
        setTimeout(() => {
          setChildrenAnimatingOut([]);
        }, 50);
      }, 300);
    } else {
      setSelectedChildCount(count);
      setUserFormData(prev => ({
        ...prev,
        numChildren: count
      }));
    }
  };

  const updateChildName = (index: number, name: string) => {
    const updatedChildren = [...userFormData.children];
    
    if (!updatedChildren[index]) {
      updatedChildren[index] = { name, age: "" };
    } else {
      updatedChildren[index] = { ...updatedChildren[index], name };
    }
    
    setUserFormData(prev => ({
      ...prev,
      children: updatedChildren
    }));
  };

  function validateStep1() {
    const newErrors: FormErrors = {};
    const { address, city, state, zipCode } = userFormData.location;

    const addressPattern = /^\d+\s+.+$/;
    if (!address.trim() || address.length < 5 || !addressPattern.test(address)) {
      newErrors.location = { ...newErrors.location, address: "Enter valid address with house number" };
    }
    
    const cityPattern = /^[A-Za-z\s\-']+$/;
    if (!city.trim() || city.length < 2 || !cityPattern.test(city)) {
      newErrors.location = { ...newErrors.location, city: "Enter valid city name" };
    }
    
    // state must be 2-letter state code for optimizer to work
    const stateRegex = /^[A-Z]{2}$/;
    if (!state.trim() || !stateRegex.test(state.toUpperCase())) {
      newErrors.location = { ...newErrors.location, state: "Enter valid 2-letter state code" };
    }
    
    // zip code must be 5 digits
    const zipRegex = /^\d{5}$/;
    if (!zipCode.trim() || !zipRegex.test(zipCode)) {
      newErrors.location = { ...newErrors.location, zipCode: "Enter valid 5-digit zip code" };
    }
    
    // phone number must be 10 digits
    const phoneRegex = /^\d{10}$/;
    const digitsOnly = userFormData.phoneNumber.replace(/\D/g, '');
    if (!userFormData.phoneNumber.trim() || digitsOnly.length !== 10 || !phoneRegex.test(digitsOnly)) {
      newErrors.phoneNumber = "Enter valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !Object.keys(newErrors.location ?? {}).length;
  }

  function validateStep2() {
    if (selectedChildCount > 0) {
      for (let i = 0; i < selectedChildCount; i++) {
        if (!userFormData.children[i]?.name || userFormData.children[i].name.trim() === "") {
          return false;
        }
      }
    }
    
    return true;
  }

  const isStep1Complete = () => {
    const { address, city, state, zipCode } = userFormData.location;
    return (
      address.trim() !== "" &&
      city.trim() !== "" &&
      state.trim() !== "" &&
      zipCode.trim() !== "" &&
      userFormData.phoneNumber.trim() !== ""
    );
  };
  
  const isStep2Complete = () => {
    if (selectedChildCount === 0) return false;
    
    for (let i = 0; i < selectedChildCount; i++) {
      if (!userFormData.children[i]?.name || userFormData.children[i].name.trim() === "") {
        return false;
      }
    }
    
    return true;
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (formStep === 1) {
      if (!validateStep1()) return;
      setFormStep(2);
    } else {
      if (!validateStep2()) return;
      setIsLoading(true);
      await handleUserFormPost();
      router.push("/user-profile");
      setIsLoading(false);
    }
  }

  function handleBack() {
    setFormStep(1);
  }

  function handleCityChange(value: string) {
    const filteredValue = value.replace(/[^A-Za-z\s\-']/g, '');
    
    const formattedValue = filteredValue
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    updateLocationField("city", formattedValue);
  }
  
  function handleAddressChange(value: string) {
    const prepositions = ['of', 'the', 'and', 'in', 'on', 'at'];
    const formattedValue = value
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !prepositions.includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
      
    updateLocationField("address", formattedValue);
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Style tag for animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
            visibility: hidden;
          }
        }
        
        .child-field-enter {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
        
        .child-field-exit {
          animation: fadeOut 0.3s ease-in-out forwards;
        }
      `}</style>
      
      {/* Left half: gradient background, dashed path, plus icons/text */}
      <div className="relative w-full md:w-1/2 h-full overflow-hidden bg-gradient-to-b from-yellow-400 to-blue-200">
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 719 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_781_890)">
            <rect width="719" height="900" fill="url(#paint0_linear_781_890)" />
            <circle opacity="0.2" cx="54.5" cy="42.5" r="102.5" fill="#A5C2CF" />
            <circle opacity="0.2" cx="55" cy="42" r="154" fill="#A5C2CF" />
            <circle opacity="0.2" cx="55" cy="42" r="215" fill="#A5C2CF" />
            <circle opacity="0.2" cx="55" cy="42" r="299" fill="#A5C2CF" />
            <circle opacity="0.1" cx="641.875" cy="704.625" r="76.875" fill="#FECC01" />
            <circle opacity="0.1" cx="642.25" cy="704.25" r="115.5" fill="#FECC01" />
            <circle opacity="0.1" cx="642.25" cy="704.25" r="161.25" fill="#FECC01" />
            <circle opacity="0.1" cx="642.25" cy="704.25" r="224.25" fill="#FECC01" />
            <path
              d="M120 0C324.612 98.2263 640.619 220.856 371.632 413.904C102.646 606.952 334.648 821.235 716 900"
              stroke="white"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="70 50"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_781_890"
              x1="359.5"
              y1="0"
              x2="359.5"
              y2="900"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FECC01" />
              <stop offset="1" stopColor="#A5C2CF" />
            </linearGradient>
            <clipPath id="clip0_781_890">
              <rect width="719" height="900" fill="white" />
            </clipPath>
          </defs>
        </svg>

        <div className="hidden md:block absolute inset-0 w-full h-full">
          <div className="absolute top-[15%] left-[10%] flex flex-col items-center space-y-4">
            <div className="w-[72px] h-[72px] flex-shrink-0 aspect-square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
              >
                <path
                  d="M19.86 39.24C19.4877 39.3747 19.1496 39.5897 18.8697 39.8696C18.5897 40.1496 18.3747 40.4877 18.24 40.86C18.0218 41.4052 17.9684 42.0024 18.0864 42.5777C18.2044 43.1529 18.4886 43.6809 18.9038 44.0961C19.3191 44.5114 19.8471 44.7956 20.4223 44.9136C20.9976 45.0316 21.5948 44.9782 22.14 44.76C22.5022 44.6055 22.8367 44.3927 23.13 44.13C23.3927 43.8366 23.6056 43.5022 23.76 43.14C23.9279 42.7839 24.0101 42.3935 24 42C23.9889 41.2057 23.6782 40.4449 23.13 39.87C22.7081 39.4537 22.1724 39.1717 21.5904 39.0596C21.0085 38.9475 20.4063 39.0102 19.86 39.24ZM59.28 27.24L55.2 15.15C54.5777 13.3897 53.4232 11.8665 51.8967 10.7915C50.3702 9.71642 48.5471 9.14277 46.68 9.14997H25.32C23.4529 9.14277 21.6298 9.71642 20.1033 10.7915C18.5768 11.8665 17.4223 13.3897 16.8 15.15L12.72 27.33C10.801 27.8325 9.10175 28.955 7.88649 30.5229C6.67123 32.0908 6.00803 34.0163 6 36V48C6.00522 49.8568 6.58464 51.6666 7.65882 53.1812C8.733 54.6958 10.2494 55.841 12 56.46V60C12 60.7956 12.3161 61.5587 12.8787 62.1213C13.4413 62.6839 14.2044 63 15 63C15.7956 63 16.5587 62.6839 17.1213 62.1213C17.6839 61.5587 18 60.7956 18 60V57H54V60C54 60.7956 54.3161 61.5587 54.8787 62.1213C55.4413 62.6839 56.2043 63 57 63C57.7957 63 58.5587 62.6839 59.1213 62.1213C59.6839 61.5587 60 60.7956 60 60V56.46C61.7506 55.841 63.267 54.6958 64.3412 53.1812C65.4154 51.6666 65.9948 49.8568 66 48V36C65.992 34.0163 65.3288 32.0908 64.1135 30.5229C62.8983 28.955 61.199 27.8325 59.28 27.33V27.24ZM22.47 17.04C22.6713 16.4441 23.0547 15.9266 23.5661 15.5605C24.0775 15.1944 24.6911 14.9983 25.32 15H46.68C47.3342 14.9658 47.9816 15.1467 48.5233 15.5151C49.065 15.8835 49.4713 16.419 49.68 17.04L52.83 27H19.17L22.47 17.04ZM60 48C60 48.7956 59.6839 49.5587 59.1213 50.1213C58.5587 50.6839 57.7957 51 57 51H15C14.2044 51 13.4413 50.6839 12.8787 50.1213C12.3161 49.5587 12 48.7956 12 48V36C12 35.2043 12.3161 34.4413 12.8787 33.8787C13.4413 33.316 14.2044 33 15 33H57C57.7957 33 58.5587 33.316 59.1213 33.8787C59.6839 34.4413 60 35.2043 60 36V48ZM49.86 39.24C49.4877 39.3747 49.1496 39.5897 48.8697 39.8696C48.5897 40.1496 48.3747 40.4877 48.24 40.86C48.0218 41.4052 47.9684 42.0024 48.0864 42.5777C48.2044 43.1529 48.4886 43.6809 48.9038 44.0961C49.3191 44.5114 49.8471 44.7956 50.4223 44.9136C50.9976 45.0316 51.5948 44.9782 52.14 44.76C52.5123 44.6252 52.8504 44.4103 53.1303 44.1303C53.4103 43.8504 53.6253 43.5123 53.76 43.14C53.9279 42.7839 54.0101 42.3935 54 42C53.9889 41.2057 53.6782 40.4449 53.13 39.87C52.7081 39.4537 52.1724 39.1717 51.5904 39.0596C51.0085 38.9475 50.4063 39.0102 49.86 39.24ZM39 39H33C32.2044 39 31.4413 39.316 30.8787 39.8787C30.3161 40.4413 30 41.2043 30 42C30 42.7956 30.3161 43.5587 30.8787 44.1213C31.4413 44.6839 32.2044 45 33 45H39C39.7957 45 40.5587 44.6839 41.1213 44.1213C41.6839 43.5587 42 42.7956 42 42C42 41.2043 41.6839 40.4413 41.1213 39.8787C40.5587 39.316 39.7957 39 39 39Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-white text-[24px] font-semibold leading-[25px] w-[244px] h-[81px] flex-shrink-0">
              Find other families and carpools in your community.
            </p>
          </div>

          <div className="absolute bottom-[25%] right-[10%] flex flex-col items-center space-y-4">
            <div className="w-[72px] h-[72px] flex-shrink-0 aspect-square">
              <svg
                xmlns="http://www.w3.org/2000/svg" 
                width="72" 
                height="72" 
                viewBox="0 0 72 72" 
                fill="none"
              >
                <path
                  d="M36 42C36.5933 42 37.1734 41.8241 37.6667 41.4944C38.1601 41.1648 38.5446 40.6962 38.7716 40.1481C38.9987 39.5999 39.0581 38.9967 38.9424 38.4147C38.8266 37.8328 38.5409 37.2982 38.1213 36.8787C37.7018 36.4591 37.1672 36.1734 36.5853 36.0576C36.0033 35.9419 35.4001 36.0013 34.8519 36.2284C34.3038 36.4554 33.8352 36.8399 33.5056 37.3333C33.1759 37.8266 33 38.4067 33 39C33 39.7957 33.3161 40.5587 33.8787 41.1213C34.4413 41.6839 35.2044 42 36 42ZM51 42C51.5933 42 52.1734 41.8241 52.6667 41.4944C53.1601 41.1648 53.5446 40.6962 53.7716 40.1481C53.9987 39.5999 54.0581 38.9967 53.9424 38.4147C53.8266 37.8328 53.5409 37.2982 53.1213 36.8787C52.7018 36.4591 52.1672 36.1734 51.5853 36.0576C51.0033 35.9419 50.4001 36.0013 49.852 36.2284C49.3038 36.4554 48.8352 36.8399 48.5056 37.3333C48.1759 37.8266 48 38.4067 48 39C48 39.7957 48.3161 40.5587 48.8787 41.1213C49.4413 41.6839 50.2044 42 51 42ZM36 54C36.5933 54 37.1734 53.8241 37.6667 53.4944C38.1601 53.1648 38.5446 52.6962 38.7716 52.148C38.9987 51.5999 39.0581 50.9967 38.9424 50.4147C38.8266 49.8328 38.5409 49.2982 38.1213 48.8787C37.7018 48.4591 37.1672 48.1734 36.5853 48.0576C36.0033 47.9419 35.4001 48.0013 34.8519 48.2284C34.3038 48.4554 33.8352 48.8399 33.5056 49.3333C33.1759 49.8266 33 50.4067 33 51C33 51.7957 33.3161 52.5587 33.8787 53.1213C34.4413 53.6839 35.2044 54 36 54ZM51 54C51.5933 54 52.1734 53.8241 52.6667 53.4944C53.1601 53.1648 53.5446 52.6962 53.7716 52.148C53.9987 51.5999 54.0581 50.9967 53.9424 50.4147C53.8266 49.8328 53.5409 49.2982 53.1213 48.8787C52.7018 48.4591 52.1672 48.1734 51.5853 48.0576C51.0033 47.9419 50.4001 48.0013 49.852 48.2284C49.3038 48.4554 48.8352 48.8399 48.5056 49.3333C48.1759 49.8266 48 50.4067 48 51C48 51.7957 48.3161 52.5587 48.8787 53.1213C49.4413 53.6839 50.2044 54 51 54ZM21 42C21.5933 42 22.1734 41.8241 22.6667 41.4944C23.1601 41.1648 23.5446 40.6962 23.7716 40.1481C23.9987 39.5999 24.0581 38.9967 23.9424 38.4147C23.8266 37.8328 23.5409 37.2982 23.1213 36.8787C22.7018 36.4591 22.1672 36.1734 21.5853 36.0576C21.0033 35.9419 20.4001 36.0013 19.8519 36.2284C19.3038 36.4554 18.8352 36.8399 18.5056 37.3333C18.1759 37.8266 18 38.4067 18 39C18 39.7957 18.3161 40.5587 18.8787 41.1213C19.4413 41.6839 20.2044 42 21 42ZM57 12H54V9C54 8.20435 53.6839 7.44129 53.1213 6.87868C52.5587 6.31607 51.7957 6 51 6C50.2043 6 49.4413 6.31607 48.8787 6.87868C48.3161 7.44129 48 8.20435 48 9V12H24V9C24 8.20435 23.6839 7.44129 23.1213 6.87868C22.5587 6.31607 21.7956 6 21 6C20.2044 6 19.4413 6.31607 18.8787 6.87868C18.3161 7.44129 18 8.20435 18 9V12H15C12.6131 12 10.3239 12.9482 8.63604 14.636C6.94821 16.3239 6 18.6131 6 21V57C6 59.3869 6.94821 61.6761 8.63604 63.364C10.3239 65.0518 12.6131 66 15 66H57C59.3869 66 61.6761 65.0518 63.364 63.364C65.0518 61.6761 66 59.3869 66 57V21C66 18.6131 65.0518 16.3239 63.364 14.636C61.6761 12.9482 59.3869 12 57 12ZM60 57C60 57.7957 59.6839 58.5587 59.1213 59.1213C58.5587 59.6839 57.7957 60 57 60H15C14.2044 60 13.4413 59.6839 12.8787 59.1213C12.3161 58.5587 12 57.7957 12 57V30H60V57ZM60 24H12V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H57C57.7957 18 58.5587 18.3161 59.1213 18.8787C59.6839 19.4413 60 20.2044 60 21V24ZM21 54C21.5933 54 22.1734 53.8241 22.6667 53.4944C23.1601 53.1648 23.5446 52.6962 23.7716 52.148C23.9987 51.5999 24.0581 50.9967 23.9424 50.4147C23.8266 49.8328 23.5409 49.2982 23.1213 48.8787C22.7018 48.4591 22.1672 48.1734 21.5853 48.0576C21.0033 47.9419 20.4001 48.0013 19.8519 48.2284C19.3038 48.4554 18.8352 48.8399 18.5056 49.3333C18.1759 49.8266 18 50.4067 18 51C18 51.7957 18.3161 52.5587 18.8787 53.1213C19.4413 53.6839 20.2044 54 21 54Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-white text-[24px] font-semibold leading-[25px] w-[280px] h-[82px] flex-shrink-0 text-right">
              Get schedules that work around you - not the other way around.
            </p>
          </div>
        </div>
      </div>

      {/* Right half: form container - conditionally render form steps */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <form className="max-w-md w-full space-y-6" onSubmit={handleSubmit}>
          {/* Logo and Welcome - shown on both steps */}
          <div className="text-center mb-6">
            <h1 className="w-[209px] mx-auto text-[#575757] text-center font-['Maven_Pro'] text-[24px] font-medium leading-normal">
              Welcome to
            </h1>
            <div className="flex justify-center mb-4">
              <Image 
                src="/Poolerz.io.png" 
                alt="POOLERZ.io Logo" 
                width={240} 
                height={60}
                priority
              />
            </div>
            <div className="w-full flex justify-center mt-2 mb-4">
              <svg width="260" height="11" viewBox="0 0 260 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full">
                <path d="M4.99976 5.60144H255" stroke="#DEDEE1" strokeWidth="10" strokeLinecap="round"/>
                <path 
                  d={`M4.99976 5.60144H${4.99976 + (progressValue / 100 * 250)}`} 
                  stroke="#4B859F" 
                  strokeWidth="10" 
                  strokeLinecap="round"
                  style={{ transition: 'all 0.3s ease-in-out' }}
                />
              </svg>
            </div>
            <h2 className="flex h-[36px] flex-col justify-center self-stretch text-black text-center font-['Open_Sans'] text-[24px] font-bold leading-normal">
              {formStep === 1 ? "Personal Information" : "Household Information"}
            </h2>
          </div>

          {/* Personal Information Fields */}
          {formStep === 1 && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Street Address"
                  className={`border p-2 w-full rounded-md focus:outline-none text-black ${
                    errors.location?.address ? "border-red-500" : "border-black"
                  }`}
                  value={userFormData.location.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                />
                {errors.location?.address && (
                  <p className="text-[#E60606] text-[12px] font-['Open_Sans'] mt-0.5">
                    {errors.location.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    className={`border p-2 w-full rounded-md focus:outline-none text-black ${
                      errors.location?.city ? "border-red-500" : "border-black"
                    }`}
                    value={userFormData.location.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                  />
                  {errors.location?.city && (
                    <p className="text-[#E60606] text-[12px] font-['Open_Sans'] mt-0.5">
                      {errors.location.city}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="State"
                    maxLength={2}
                    className={`border p-2 w-full rounded-md focus:outline-none text-black ${
                      errors.location?.state ? "border-red-500" : "border-black"
                    }`}
                    value={userFormData.location.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                  />
                  {errors.location?.state && (
                    <p className="text-[#E60606] text-[12px] font-['Open_Sans'] mt-0.5">
                      {errors.location.state}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    maxLength={5}
                    className={`border p-2 w-full rounded-md focus:outline-none text-black ${
                      errors.location?.zipCode ? "border-red-500" : "border-black"
                    }`}
                    value={userFormData.location.zipCode}
                    onChange={(e) => handleZipChange(e.target.value)}
                  />
                  {errors.location?.zipCode && (
                    <p className="text-[#E60606] text-[12px] font-['Open_Sans'] mt-0.5">
                      {errors.location.zipCode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  pattern="[0-9]{10}"
                  className={`border p-2 w-full rounded-md focus:outline-none text-black ${
                    errors.phoneNumber ? "border-red-500" : "border-black"
                  }`}
                  value={userFormData.phoneNumber}
                  onChange={(e) => updatePhoneNumber(e.target.value)}
                />
                {errors.phoneNumber && (
                  <p className="text-[#E60606] text-[12px] font-['Open_Sans'] mt-0.5">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Family Information Fields */}
          {formStep === 2 && (
            <div className="space-y-6">
              <div>
                {selectedChildCount === 0 ? (
                  <div className="flex flex-col w-full mb-4">
                    <label className="text-black font-['Open_Sans'] text-[16px] font-normal mb-2 leading-normal">
                      How many children do you have?
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-2 border border-black rounded-md focus:outline-none appearance-none text-black font-['Open_Sans'] text-[16px] font-normal leading-normal"
                        value={selectedChildCount}
                        onChange={(e) => handleChildCountChange(Number(e.target.value))}
                      >
                        <option value="0">Select</option>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L7 7L13 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4 child-fields-container">
                  {Array.from({ length: Math.max(selectedChildCount, ...childrenAnimatingOut.map(i => i + 1)) }).map((_, index) => {
                    const isAnimatingOut = childrenAnimatingOut.includes(index);
                    if (index >= selectedChildCount && !isAnimatingOut) return null;
                    
                    return (
                      <div 
                        key={`child-${index}`} 
                        className={`child-field flex flex-col w-full ${isAnimatingOut ? 'child-field-exit' : 'child-field-enter'}`}
                        style={{ marginBottom: isAnimatingOut ? '0' : '1rem' }}
                      >
                        <div className="flex items-center mb-2">
                          <label className="text-black font-['Open_Sans'] text-[16px] font-normal leading-normal flex-grow">
                            Child {index + 1} Name:
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(index)}
                            className="text-[#E60606] font-['Open_Sans'] text-[20px] font-normal w-[21px] h-[21px] flex items-center justify-center"
                            aria-label="Remove child"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          className="w-full p-2 border border-black rounded-md focus:outline-none text-black font-['Open_Sans'] text-[16px] font-normal leading-normal"
                          value={userFormData.children[index]?.name || ""}
                          onChange={(e) => updateChildName(index, e.target.value)}
                          placeholder="Enter child name"
                        />
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleAddNewChild}
                      className="text-[#000] font-['Open_Sans'] text-[16px] font-normal flex items-center"
                    >
                      Add Child +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue/Submit Button */}
          <div className="pt-2">
            {formStep === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="w-full p-3 mb-2 rounded-md font-semibold bg-black text-white hover:bg-gray-900 transition-colors"
              >
                Back
              </button>
            )}
            
            {!isLoading ? (
              <button
                type="submit"
                disabled={(formStep === 1 && !isStep1Complete()) || (formStep === 2 && !isStep2Complete())}
                className={`w-full px-6 py-3 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] text-center ${
                  (formStep === 1 && isStep1Complete()) || (formStep === 2 && isStep2Complete())
                    ? "bg-[#4F95B0] border border-[#4F95B0] hover:bg-[#3a7b94] transition-colors"
                    : "bg-[#A5C2CF] cursor-not-allowed"
                }`}
              >
                {formStep === 1 ? "Continue" : "Submit"}
              </button>
            ) : (
              <button
                disabled
                className="w-full px-6 py-3 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] text-center bg-[#A5C2CF] cursor-not-allowed"
              >
                <span>Loading...</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
