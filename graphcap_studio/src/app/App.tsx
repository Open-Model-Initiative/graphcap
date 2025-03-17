import { Box } from "@chakra-ui/react";
import { type ReactNode } from "react";

interface AppProps {
	readonly children: ReactNode;
}

function App({ children }: Readonly<AppProps>) {
	return (
		<Box minH="100vh" bg="background" color="text.default">
			{children}
		</Box>
	);
}

export default App;
