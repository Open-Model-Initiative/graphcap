import { QueryCache, QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { errorToast } from "./toast";

const makeQueryClient = () =>
	new QueryClient({
		queryCache: new QueryCache({
			onError: (error, query) => {
				console.log(error);
				if (query.meta?.errorMessage) {
					errorToast(query.meta.errorMessage as string);
				} else {
					errorToast(`An error occurred: ${error.message}`);
				}
			},
		}),
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				throwOnError: true,
			},
			mutations: {
				throwOnError: true,
			},
		},
	});

export const getQueryClient = cache(() => makeQueryClient());
