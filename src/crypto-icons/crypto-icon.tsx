import * as React from "react";
import { IconProps } from "./types";
import useDynamicSVGImport from "./useDynamicSVGImport";

/**
 * Simple wrapper for dynamic SVG import hook. You can implement your own wrapper,
 * or even use the hook directly in your components.
 */
export const CryptoIcon: React.FC<IconProps> = ({
    name,
    size,
    onCompleted,
    onError,
    ...rest
}): React.ReactElement | null => {
    const { SvgIcon } = useDynamicSVGImport(name, {
        onCompleted,
        onError,
    });
    return <SvgIcon {...rest} style={{ height: size, width: size }} />;
};