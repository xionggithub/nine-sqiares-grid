// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import { base, dashboard, DashboardState, bitable } from "@lark-base-open/js-sdk";
import { useDatasourceConfigStore, useDatasourceStore, useTextConfigStore } from './store';
import { TableDataGroupHelper, IDatasourceConfigCacheType } from "./utils/tableDataGroupHelper";

function App() {

    const { datasource, updateDatasource } = useDatasourceStore((state) => state);

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);

    // 样式配置数据
    const { textConfig, updateTextConfig } = useTextConfigStore((state) => state);

    let datasourceConfigCache: IDatasourceConfigCacheType = {
        tableId: '',
        dataRange: '',
        personnelField: '',
        horizontalField: '',
        horizontalCategories: {
            left: [''],
            middle: [''],
            right: ['']
        },

        verticalField: '',
        verticalCategories: {
            up: [''],
            middle: [''],
            down: ['']
        },
        groupField: ''
    };

    const [isLoading, setIsLoading] = useState(true)

    // 获取表格列表
    const getTableList = useCallback((tableIdList: any) => {
        return tableIdList.map(async (table: any) => {
            const name = await table.getName();
            return {
                tableName: name,
                tableId: table.id,
            };
        });
    }, []);

    const dataHelper = new TableDataGroupHelper()

    async function initConfigData(id: string | null) {
        console.log('-----------------------------------------------更新表格数据', id, dashboard.state);
        //LIGHT = "LIGHT", DARK = "DARK"
        const theme = await bitable.bridge.getTheme()
        if (theme === 'LIGHT') {
            datasource.theme = 'light'
        } else {
            datasource.theme = 'dark'
        }
        console.log(theme, '++++++++++++++++++')
        updateTheme(theme.toLocaleLowerCase())
        const tableIdList = await base.getTableList();
        // console.log('获取表 id 列表: ',tableIdList)
        const tableList = await Promise.all(getTableList(tableIdList));
        console.log('获取所有表: ',tableList);
        datasource.tables = [...tableList];
        const tableId = id ? id : tableList[0].tableId;
        datasource.tableId = tableId;
        datasourceConfig.tableId = tableId
        datasourceConfigCache.tableId = tableId
        const table = await base.getTable(tableId);
        console.log('获取当前选中的表',table)
        const fields = await table.getFieldMetaList()
        datasource.fields[tableId] = [...fields];
        // console.log('获取选中表的所有字段信息: ',datasource.fields);
        datasource.dataRanges = await dashboard.getTableDataRange(tableId)
        datasourceConfig.dataRange = 'All';
        console.log('获取表数据范围: ',datasource.dataRanges);
        // 如果不是创建面板，则根据 自定义配置组装数据
        if (dashboard.state !== DashboardState.Create) {
            await dataHelper.prepareData(tableId, datasource, datasourceConfigCache)
            updateDatasource({...datasource})
        }
        console.log('------------------------------------------------------数据已经准备好: ',datasource, new Date().toISOString())
        // 强制刷新
        setIsLoading(false)
    }

    function updateTheme(theme: string) {
        document.body.setAttribute('theme-mode', theme);
    }

    useEffect(() => {
        bitable.bridge.onThemeChange((event) => {
            console.log('theme change', event.data.theme);
            if (event.data.theme === 'LIGHT') {
                datasource.theme = 'light'
            } else {
                datasource.theme = 'dark'
            }
            updateTheme(event.data.theme.toLocaleLowerCase())
            updateDatasource({ ...datasource })
        });
        async function getConfig() {
            // 先获取保存的配置数据
            if (dashboard.state !== DashboardState.Create) {
                console.log('load config')
                dashboard.getConfig().then((config) => {
                    console.log('获取到 config start========：', config, textConfig, datasourceConfig, {...datasourceConfig, ...config.customConfig.datasourceConfig});
                    updateDatasourceConfig({...datasourceConfig, ...config.customConfig.datasourceConfig})
                    updateTextConfig({...textConfig, ...config.customConfig.textConfig})
                    datasourceConfigCache = {...JSON.parse(JSON.stringify(config.customConfig.datasourceConfig))}
                    console.log('获取到 config end=====：', config, datasourceConfigCache);
                    initConfigData(config.customConfig.datasourceConfig.tableId).then();
                })
            } else {
                initConfigData(null).then();
            }
        }
        getConfig().then();
        dashboard.onConfigChange(getConfig);
        // 监控数据变化
        dashboard.onDataChange(getConfig);
    }, []);

    return <div>
        {(
            isLoading ? (<div style={{ width: '100%', height: '100%', display: 'grid', alignItems: 'center', justifyItems: 'center' }}>
                <div style={{textAlign: 'center', fontSize: '30px'}}>加载中...</div>
            </div>) : (<div className="flex h-full">
                <NineSquaresGrid/>
                {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
                    <ConfigPanel/>
                ) : null}
            </div>)
        )}
    </div>
}

export default App
