import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OwnedPogs from "../components/OwnedPogs";

interface CardData {
  id: number;
  name: string;
  symbol: string;
  color: string;
  current_price: number;
  previous_price: number;
  percent_drop: number;
  quantity: number;
}

const Account = () => {
  const [userName, setUserName] = useState("AJ"); // Replace with the actual user's name
  const [userPogs, setUserPogs] = useState<CardData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    getUsername();
  }, []);

  const getUsername = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUserName("");
        return;
      }

      const response = await fetch("http://localhost:5000/login/decrypt/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to decrypt token");
      }

      const decodedToken = await response.json();
      setUserName(decodedToken.name);
    } catch (error) {
      console.error("Error decrypting token:", error);
      setUserName("");
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/list/owned/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setUserPogs(result);
      } else {
        console.error("Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleSell = async (id: number, sellQuantity: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/transact/sell/${id}/${sellQuantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Sell transaction successful.");
        navigate(window.location.pathname, { replace: true });
      } else {
        console.error("Failed to sell Pog.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <Fragment>
      <div className="container mx-auto py-4">
        <div className="bg-white border border-gray rounded-md p-4">
          <h2 className="text-primary font-semibold mb-4">
            {userName}'s Account
          </h2>
          {userPogs.length === 0 ? (
            <div className="bg-white border border-gray rounded-md p-4 flex items-center justify-center">
              No pogs owned!
            </div>
          ) : (
            userPogs.map((userPog) => (
              <OwnedPogs
                id={userPog.id}
                key={userPog.id}
                name={userPog.name}
                current_price={userPog.current_price}
                symbol={userPog.symbol}
                quantity={userPog.quantity}
                handleSell={handleSell}
              />
            ))
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Account;
