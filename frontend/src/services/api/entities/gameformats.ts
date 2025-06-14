import { QueryClient } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";

import { IGameFormat } from "@/types";

export const createGameFormatApiHooks = (queryClient: QueryClient) => {
  const { useList, useById } = createApiHooks<IGameFormat>(
    "gameformats",
    queryClient,
  );

  return {
    useList,
    useById,
  };
};
