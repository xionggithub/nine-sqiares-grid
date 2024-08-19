import React, { useCallback, useEffect, useState } from 'react';
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import {base, dashboard, DashboardState, bitable, IDataCondition, ITable} from "@lark-base-open/js-sdk";
import { useDatasourceConfigStore, useDatasourceStore, useTextConfigStore } from './store';
import { TableDataGroupHelper, IDatasourceConfigCacheType } from "./utils/tableDataGroupHelper";
import Icon, {IconDeleteStroked, IconPlus} from '@douyinfe/semi-icons';
import IconLoading from './assets/icon_loading.svg?react';

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

    function configRenderData(tableId: string, fields: any[]): void {
        const userFields = fields.filter(field => field.type === 11)
        const userField: any = userFields[0]
        datasourceConfig.personnelField = userField.id;
        datasourceConfigCache.personnelField = userField.id
        const optionFields = fields.filter(field => field.type === 3)
        const horizontalField: any = optionFields[0];
        datasourceConfig.horizontalField = horizontalField.id
        datasourceConfigCache.horizontalField = horizontalField.id
        if (horizontalField.property?.options) {
            let options = (horizontalField.property.options as any[]).map(item => ({ ...item, disabled: false}))
            if (options.length === 1) {
                options[0].disabled = true
                datasourceConfig.horizontalCategories.left = [options[0].id]
                datasourceConfigCache.horizontalCategories.left = [options[0].id]
                return;
            } else if (options.length === 2) {
                options[0].disabled = true
                datasourceConfig.horizontalCategories.left = [options[0].id]
                datasourceConfigCache.horizontalCategories.left = [options[0].id]
                options[1].disabled = true
                datasourceConfig.horizontalCategories.middle = [options[1].id]
                datasourceConfigCache.horizontalCategories.middle = [options[1].id]
                return;
            } else if (options.length >= 3) {
                options[0].disabled = true
                datasourceConfig.horizontalCategories.left = [options[0].id]
                datasourceConfigCache.horizontalCategories.left = [options[0].id]
                options[Math.floor(options.length / 2)].disabled = true
                datasourceConfig.horizontalCategories.middle = [options[Math.floor(options.length / 2)].id]
                datasourceConfigCache.horizontalCategories.middle = [options[Math.floor(options.length / 2)].id]
                options[options.length-1].disabled = true
                datasourceConfig.horizontalCategories.right = [options[options.length -1].id]
                datasourceConfigCache.horizontalCategories.right = [options[options.length -1].id]
            }
        }

        const verticalField:any = optionFields[1];
        datasourceConfig.verticalField = verticalField.id
        datasourceConfigCache.verticalField = verticalField.id
        if (verticalField.property?.options) {
            let options = (verticalField.property.options as any[]).map(item => ({ ...item, disabled: false}))
            if (options.length === 1) {
                options[0].disabled = true
                datasourceConfig.verticalCategories.up = [options[0].id]
                datasourceConfigCache.verticalCategories.up = [options[0].id]
                return;
            } else if (options.length === 2) {
                options[0].disabled = true
                datasourceConfig.verticalCategories.up = [options[0].id]
                datasourceConfigCache.verticalCategories.up = [options[0].id]
                options[1].disabled = true
                datasourceConfig.verticalCategories.middle = [options[1].id]
                datasourceConfigCache.verticalCategories.middle = [options[1].id]
                return;
            } else if (options.length >= 3) {
                options[0].disabled = true
                datasourceConfig.verticalCategories.up = [options[0].id]
                datasourceConfigCache.verticalCategories.up = [options[0].id]
                options[Math.floor(options.length / 2)].disabled = true
                datasourceConfig.verticalCategories.middle = [options[Math.floor(options.length / 2)].id]
                datasourceConfigCache.verticalCategories.middle = [options[Math.floor(options.length / 2)].id]
                options[options.length-1].disabled = true
                datasourceConfig.verticalCategories.down = [options[options.length -1].id]
                datasourceConfigCache.verticalCategories.down = [options[options.length -1].id]
            }
        }
    }

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
        let tableId = id ? id : tableList[0].tableId;
        if (!id) {
           const availableInfo = await dataHelper.findAvailableTableForRender(tableList, 0);
           console.log(availableInfo, 'availableInfo---------')
           if (availableInfo && availableInfo.tableId) {
               // config render data
               tableId = availableInfo.tableId;
               datasource.fields[availableInfo.tableId] = availableInfo.fields
               configRenderData(availableInfo.tableId, availableInfo.fields)
           }
        }
        console.log(datasourceConfig, datasourceConfigCache, '-----------prepare render data')
        datasource.tableId = tableId;
        datasourceConfig.tableId = tableId
        datasourceConfigCache.tableId = tableId

        // 如果没有字段数据则拉取
        if (!datasource.fields[tableId] || datasource.fields[tableId].length === 0) {
            const table = await base.getTable(tableId);
            console.log('获取当前选中的表',table)
            const fields = await table.getFieldMetaList()
            datasource.fields[tableId] = [...fields];
        }

        console.log('获取选中表的所有字段信息: ',datasource.fields);
        const tableDataRange: any[] =  await dashboard.getTableDataRange(tableId)
        datasource.dataRanges[tableId] = tableDataRange.map(item => ({
            type: item.type,
            viewId: item.viewId,
            viewName:item.viewName
        }))
        datasourceConfig.dataRange = 'All';
        console.log('获取表数据范围: ',datasource.dataRanges);
        // 如果不是创建面板，则根据 自定义配置组装数据
        if (dashboard.state !== DashboardState.Create ||
            (datasourceConfig.tableId && datasourceConfig.personnelField  && datasourceConfig.horizontalField  && datasourceConfig.verticalField)
        ) {
            await dataHelper.prepareData(tableId, datasource, datasourceConfigCache)
            updateDatasource({...(datasource as any)})
        }
        console.log('------------------------------------------------------数据已经准备好: ',datasource, new Date().toISOString())
        // 强制刷新
        setIsLoading(false)

        // 渲染完通知 宿主
        setTimeout(() => {
            console.log('------------------------------------------------------渲染完成 ');
            dashboard.setRendered().then( res => {
                console.log('set rendered: ',res);
            })
        }, 1000);
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
            updateDatasource({ ...(datasource as any) })
        });
        async function getConfig() {
            // 先获取保存的配置数据
            if (dashboard.state !== DashboardState.Create) {
                console.log('load config')
                dashboard.getConfig().then((config) => {
                    const customConfig: any = config.customConfig
                    const dataConditions: IDataCondition[] = config.dataConditions
                    // 主要处理 复制模版 custom config 中的数据不会被动态替换，导致复制模版获取的 table id 不对
                    if (dataConditions.length > 0) {
                        const firstCondition = dataConditions[0];
                        if (firstCondition.tableId) {
                            customConfig.datasourceConfig.tableId = firstCondition.tableId
                        }
                    }
                    console.log('获取到 config start========：', config, textConfig, datasourceConfig, {...datasourceConfig, ...customConfig.datasourceConfig});
                    updateDatasourceConfig({...datasourceConfig, ...customConfig.datasourceConfig})
                    updateTextConfig({...textConfig, ...customConfig.textConfig})
                    datasourceConfigCache = {...datasourceConfig, ...customConfig.datasourceConfig}
                    console.log('获取到 config end=====：', config, datasourceConfigCache);
                    initConfigData(customConfig.datasourceConfig.tableId).then();
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

    return isLoading ?
        (<div style={{ width: '100%', height: '100%', display: 'grid', alignItems: 'center', justifyItems: 'center' }}>
            <div style={{ width: 'max-content', height: 'max-content', display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '10px', justifyItems: 'center' }}>
                <Icon svg={<IconLoading />} />
                <div style={{textAlign: 'center', fontSize: '16px', color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF" }}>加载中...</div>
            </div>
        </div>) :
        (<div>
            <div className="flex h-full">
                <NineSquaresGrid/>
                {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
                    <ConfigPanel
                        tables={datasource.tables}
                        dataRanges={datasource.dataRanges[datasource.tableId]}
                    />
                ) : null}
            </div>
        </div>)
}

export default App
