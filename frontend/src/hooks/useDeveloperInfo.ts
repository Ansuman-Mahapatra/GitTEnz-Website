import { useState, useEffect } from "react";
import { API_URL } from "@/config";

export function useDeveloperInfo() {
  const [devInfo, setDevInfo] = useState({
    linkedin: "https://www.linkedin.com/in/ansuman197463/",
    github: "https://github.com/Ansuman-Mahapatra",
    email: "ansuman197463@gmail.com"
  });

  useEffect(() => {
    fetch(`${API_URL}/api/public/developer-info`)
      .then(res => res.json())
      .then(data => {
        if (data.linkedin && data.github && data.email) {
          setDevInfo(data);
        }
      })
      .catch(err => console.error("Could not fetch developer info:", err));
  }, []);

  return devInfo;
}
