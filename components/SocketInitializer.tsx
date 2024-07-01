"use client";

import { useEffect } from "react";

const SocketInitializer = () => {
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
    };
    initSocket();
  }, []);

  return null;
};

export default SocketInitializer;
