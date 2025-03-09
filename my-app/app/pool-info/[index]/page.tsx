"use client";

import { useParams } from "next/navigation";

export default function DynamicInfo() {
  const params = useParams();

  return <h1>Hello index {params.index}</h1>;
}