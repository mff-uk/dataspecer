import { useMediaQuery } from "./use-media-query";

export const useIsMobile = () => {
    return !useMediaQuery("(min-width: 768px)");
}