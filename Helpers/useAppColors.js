import { useSelector } from "react-redux";
import { lightColors, darkColors } from '../colors';

export default function useAppColors () {
    const isDark = useSelector((state) => state.theme.isDark);
    return isDark ? darkColors : lightColors;
}