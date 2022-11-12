import * as React from "react";
import { ReactComponent as DefaultIcon } from "cryptocurrency-icons/svg/icon/generic.svg";
import { DynamicSVGImportOptions } from "./types";

export default function useDynamicSVGImport(
    name: string,
    options: DynamicSVGImportOptions = {},
) {
    name = name?.toLowerCase()
    if (name == 'weth') {
        name = 'eth'
    }

    const [svgIcon, setSvgIcon] = React.useState<React.FC<React.SVGProps<SVGSVGElement>>>(DefaultIcon);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<Error>();

    const { onCompleted, onError } = options;

    React.useEffect(() => {
        setLoading(true);
        const importIcon = async (): Promise<void> => {
            if (name == null) {
                return
            }
            try {
                const svgIcon = (
                    await import(
                        `cryptocurrency-icons/svg/icon/${name}.svg`
                    )
                ).ReactComponent
                setSvgIcon(svgIcon);
                onCompleted?.(name, svgIcon);
            } catch (err) {
                if (err.message.includes("Cannot find module")) {
                    setSvgIcon(DefaultIcon);
                    onCompleted?.(name, DefaultIcon);
                } else {
                    console.error("IMPORT ERROR", err.message);
                    setSvgIcon(DefaultIcon);
                    onError?.(err);
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        };
        importIcon();
    }, [name, onCompleted, onError]);

    return { error, loading, SvgIcon: svgIcon };
}