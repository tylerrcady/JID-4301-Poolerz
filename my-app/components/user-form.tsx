"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddModal from "@/components/modals/add-modal";
import BackButton from "@/components/atoms/back-button";

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
    // 5 children limit
    if (selectedChildCount >= 5) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      if (validateStep1()) {
        setFormStep(2);
      }
    } else {
      if (validateStep2()) {
        setIsLoading(true);
        try {
          await handleUserFormPost();
          router.push("/user-profile");
        } catch (error) {
          console.error("Error submitting form:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

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
    <div className="flex flex-col md:flex-row w-full min-h-screen overflow-hidden">
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
      
      {/* Mobile: SVG header - only shown on mobile */}
      <div className="relative w-full h-32 md:hidden bg-gradient-to-b from-yellow-400 to-blue-200">
        <Image
          src="/mobile_poolerz.svg"
          alt="Mobile Hero"
          className="absolute inset-0 w-full h-full"
          width={324}
          height={147}
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      {/* Desktop: Left half gradient background - only shown on desktop */}
      <div className="relative hidden md:block md:w-1/2 md:h-full md:min-h-screen bg-gradient-to-b from-yellow-400 to-blue-200">
        <Image
          src="/form-hero.svg"
          alt="Form Hero"
          className="absolute inset-0 w-full h-full"
          width={1000}
          height={1000}
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Form container */}
      <div className="w-full md:w-1/2 flex items-start justify-center p-4 md:p-12 bg-white overflow-y-auto">
        <form className="max-w-md w-full space-y-4 md:space-y-6 py-2 md:py-4" onSubmit={handleSubmit}>
          {/* Logo and Welcome - shown on both steps */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="w-[209px] mx-auto text-[#575757] text-center font-['Maven_Pro'] text-[20px] md:text-[24px] font-medium leading-normal">
              Welcome to
            </h1>
            <div className="flex justify-center mb-2 md:mb-4">
              <Image 
                src="/Poolerz.io.png" 
                alt="POOLERZ.io Logo" 
                width={200}
                height={50}
                className="w-[180px] md:w-[240px]"
                priority
              />
            </div>
            <div className="w-full flex justify-center mt-2 mb-3 md:mb-4">
              <svg width="260" height="11" viewBox="0 0 260 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[220px] md:w-[260px] max-w-full">
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
            <h2 className="flex h-[30px] md:h-[36px] flex-col justify-center self-stretch text-black text-center font-['Open_Sans'] text-[20px] md:text-[24px] font-bold leading-normal">
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
                        className={`child-field w-full ${isAnimatingOut ? 'child-field-exit' : 'child-field-enter'}`}
                        style={{ marginBottom: isAnimatingOut ? '0' : '1rem' }}
                      >
                        <label className="text-black font-['Open_Sans'] text-[16px] font-normal mb-2 block leading-normal">
                          Child {index + 1} Name:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full p-2 border border-black rounded-md focus:outline-none text-black font-['Open_Sans'] text-[16px] font-normal leading-normal"
                            value={userFormData.children[index]?.name || ""}
                            onChange={(e) => updateChildName(index, e.target.value)}
                            placeholder="Enter child name"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(index)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#E60606] font-['Open_Sans'] text-[20px] font-normal w-[21px] h-[21px] flex items-center justify-center"
                            aria-label="Remove child"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleAddNewChild}
                      className={`text-[#000] font-['Open_Sans'] text-[16px] font-normal flex items-center ${
                        selectedChildCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={selectedChildCount >= 5}
                    >
                      Add Child +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue/Submit Button */}
            <div className="flex flex-col pt-2 items-center">
            {!isLoading ? (
              <button
              type="submit"
              disabled={(formStep === 1 && !isStep1Complete()) || (formStep === 2 && !isStep2Complete())}
              className={`w-full mb-5 px-6 py-2 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] text-center ${
                (formStep === 1 && isStep1Complete()) || (formStep === 2 && isStep2Complete())
                ? "bg-blue border border-blue"
                : "bg-lightblue cursor-not-allowed"
              }`}
              >
              {formStep === 1 ? "Continue" : "Submit"}
              </button>
            ) : (
              <button
              disabled
              className="mb-2 w-full px-6 py-2 rounded-md text-white text-lg md:text-xl font-semibold font-['Open Sans'] text-center bg-lightblue cursor-not-allowed"
              >
              <span>Loading...</span>
              </button>
            )}
            {formStep === 2 && (
              <BackButton onClick={handleBack} />
            )}
            </div>
        </form>
      </div>
    </div>
  );
}
