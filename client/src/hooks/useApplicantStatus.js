import { useEffect, useState } from "react";
import { getApplicantByTelegramId } from "../utils/api";

function useApplicantStatus(telegramId) {
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(Boolean(telegramId));
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!telegramId) {
      setApplicant(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError("");
      const nextApplicant = await getApplicantByTelegramId(telegramId);
      setApplicant(nextApplicant);
      return nextApplicant;
    } catch (requestError) {
      if (requestError.response?.status !== 404) {
        setError("We could not load your registration details.");
      }
      setApplicant(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [telegramId]);

  return {
    applicant,
    isRegistered: Boolean(applicant),
    loading,
    error,
    refresh
  };
}

export default useApplicantStatus;
