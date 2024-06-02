import { useEffect, useMemo, useRef } from 'react';
import { useTypeConfigStore, useStyleConfigStore } from '../../store';
import {
    base,
    IAttachmentField,
    dashboard,
    DashboardState,
} from '@lark-base-open/js-sdk';
import "./index.css"

interface NineSquaresGridProps {

}

export  function NineSquaresGrid({}: NineSquaresGridProps) {

    const { typeConfig } = useTypeConfigStore((state) => state);

    return (
        <div
            className="relative flex-1 h-screen"
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    typeConfig.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
            }}
        >

        </div>
    )
}
