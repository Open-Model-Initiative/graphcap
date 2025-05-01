import { Box, BoxProps } from "@graphcap/ui/components";
import { cn } from "@graphcap/ui/utils";

type StackProps = BoxProps;

export const Stack = ({ className, ...props }: StackProps) => {
  return (
    <Box className={cn("flex flex-col items-start", className)} {...props} />
  );
};
