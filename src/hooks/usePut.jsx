import { useContext, useState } from "react";

import api from "../api/api";

export function usePut(url, { onSuccess, onError } = {}) {
  const [error, setError] = useState(null);

  const put = async (id, payload) => {
    setError(null);
    
    const urlId = `${url}/${id}`;
    try {
      const res = await api.put(urlId, payload);

      onSuccess?.(res, res);
      return res;
    } catch (error) {
      setError(error);
      onError?.(error);
      throw error;
    } finally {
    }
  };

  return { put, error };
}
