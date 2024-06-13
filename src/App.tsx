import { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import { base, dashboard, DashboardState, IRecord, ITable, bitable } from "@lark-base-open/js-sdk";
import { useDatasourceConfigStore, useDatasourceStore, useTextConfigStore } from './store';
import { TableDataGroupHelper } from "./utils/tableDataGroupHelper";

interface IDatasourceConfigCacheType {
    tableId: string;
    dataRange: string;
    personnelField: string;
    horizontalField: string;
    horizontalCategories: {
        left: string[],
        middle: string[],
        right: string[]
    };
    verticalField: string;
    verticalCategories: {
        up: string[],
        middle: string[],
        down: string[]
    };
    groupField: string;
}

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

    // 数据范围 视图
    const getTableRange = useCallback((tableId: string) => {
        return dashboard.getTableDataRange(tableId);
    }, []);

    // 获取列信息
    const getCategories = (table: any, tableId: string) => {
        return table.getFieldMetaList(tableId);
    };

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

    function filterRecordsByInfo(allRecords: IRecord[],
                                 verticalField: any | null,
                                 verticalType: 'up' | 'middle' | 'down',
                                 horizontalField: any | null,
                                 horizontalType: 'left' | 'middle' | 'right',
    ): IRecord[] {
        let filteredRecord = []
        if (verticalField) {
            let optionIds = datasourceConfigCache.verticalCategories[verticalType] ?? [];
            console.log(verticalType, optionIds)
            filteredRecord = allRecords.filter(item => optionIds.some(id => {
                let itemFieldInfo = ((item.fields[verticalField.id]) instanceof Array) ? (item.fields[verticalField.id] as any[])[0] : (item.fields[verticalField.id]);
                const itemId = itemFieldInfo ? itemFieldInfo['id'] : ''
                return id === itemId
            }))
        }
        console.log(JSON.parse(JSON.stringify(filteredRecord)))
        if (horizontalField) {
            let optionIds = datasourceConfigCache.horizontalCategories[horizontalType] ?? [];
            console.log(horizontalType,optionIds)
            filteredRecord = filteredRecord.filter(item => optionIds.some(id => {
                let itemFieldInfo = ((item.fields[horizontalField.id]) instanceof Array) ? (item.fields[horizontalField.id] as any[])[0] : (item.fields[horizontalField.id]);
                const itemId = itemFieldInfo ? itemFieldInfo['id'] : ''
                return id === itemId
            }))
        }
        console.log(JSON.parse(JSON.stringify(filteredRecord)))
        if (!verticalField || !horizontalField) {
            console.log('组装数据错误，缺失横轴或则竖轴字段')
        }
        return [...filteredRecord]
    }

    // function groupRecordsByInfo(records: IRecord[],
    //                             groupField: any | null,
    //                             groupTexts: string[]
    //
    // ): { category: string, persons: IRecord[] }[] {
    //     if (!groupField) {
    //         return [{ category: '', persons: records }]
    //     }
    //     let groupList: { category: string, persons: IRecord[] }[] = []
    //     groupTexts.forEach(text => {
    //         let filteredList = records.filter(item => {
    //             let itemFieldInfo = ((item.fields[groupField.id]) instanceof Array) ? (item.fields[groupField.id] as any[])[0] : (item.fields[groupField.id]);
    //             const itemText = itemFieldInfo ? itemFieldInfo['text'] : ''
    //             return text === itemText
    //         })
    //         groupList.push({ category: text, persons: filteredList })
    //     });
    //     return groupList
    // }




    const dataHelper = new TableDataGroupHelper()

    async function prepareData(table: ITable) {
        const fields = await table.getFieldMetaList()
        console.log('prepare data fields',fields);
        // 获取数据
        const allRecords = await  dataHelper.loadAllRecordsForTable(table)
        console.log('加载完当前 table 所以记录 ', allRecords,)
        datasource.totalRowCount = allRecords.length
        datasource.allRecords[table.id] = allRecords
        // 根据配置面板数据准备数据
        // 数据根据 四个字段进行组装显示
        let personField = fields.find(item => item.id === datasourceConfigCache.personnelField)
        let groupField = fields.find(item => item.id === datasourceConfigCache.groupField)
        let verticalField = fields.find(item => item.id === datasourceConfigCache.verticalField)
        let horizontalField = fields.find(item => item.id === datasourceConfigCache.horizontalField)
        const groupText = dataHelper.groupTextsFor(allRecords, groupField)
        console.log(personField, groupField, verticalField, horizontalField, datasourceConfigCache, groupText)
        // 九个格子的数据未分组的数据数组
        let leftUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'left');
        let leftUpGroupList = dataHelper.groupRecordsByInfo(leftUpList, groupField, groupText);
        datasource.leftUpValue = dataHelper.mapRecordByDisplayInfo(leftUpGroupList, personField, datasource)

        let middleUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'middle');
        let middleUpGroupList = dataHelper.groupRecordsByInfo(middleUpList, groupField, groupText)
        datasource.middleUpValue = dataHelper.mapRecordByDisplayInfo(middleUpGroupList, personField, datasource)

        let rightUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'right');
        let rightUpGroupList = dataHelper.groupRecordsByInfo(rightUpList, groupField, groupText)
        datasource.rightUpValue = dataHelper.mapRecordByDisplayInfo(rightUpGroupList, personField, datasource)

        let leftMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'left');
        let leftMiddleGroupList = dataHelper.groupRecordsByInfo(leftMiddleList, groupField, groupText)
        datasource.leftMiddleValue = dataHelper.mapRecordByDisplayInfo(leftMiddleGroupList, personField, datasource)

        let middleMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'middle');
        let middleMiddleGroupList = dataHelper.groupRecordsByInfo(middleMiddleList, groupField, groupText)
        datasource.middleMiddleValue = dataHelper.mapRecordByDisplayInfo(middleMiddleGroupList, personField, datasource)

        let rightMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'right');
        let rightMiddleGroupList = dataHelper.groupRecordsByInfo(rightMiddleList, groupField, groupText)
        datasource.rightMiddleValue = dataHelper.mapRecordByDisplayInfo(rightMiddleGroupList, personField, datasource)

        let leftDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'left');
        let leftDownGroupList = dataHelper.groupRecordsByInfo(leftDownList, groupField, groupText)
        datasource.leftDownValue = dataHelper.mapRecordByDisplayInfo(leftDownGroupList, personField, datasource)

        let middleDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'middle');
        let middleDownGroupList = dataHelper.groupRecordsByInfo(middleDownList, groupField, groupText)
        datasource.middleDownValue = dataHelper.mapRecordByDisplayInfo(middleDownGroupList, personField, datasource)

        let rightDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'right');
        let rightDownGroupList = dataHelper.groupRecordsByInfo(rightDownList, groupField, groupText)
        datasource.rightDownValue = dataHelper.mapRecordByDisplayInfo(rightDownGroupList, personField, datasource)
        updateDatasource({...datasource})
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
            await prepareData(table);
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
