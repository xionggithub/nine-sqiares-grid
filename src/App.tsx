import {useCallback, useEffect, useState} from 'react';
import {NineSquaresGrid} from "./components/nineSquaresGrid";
import {ConfigPanel} from "./components/configPanel";
import {base, dashboard, DashboardState, IRecord, ITable} from "@lark-base-open/js-sdk";
import {useDatasourceConfigStore, useDatasourceStore, useTextConfigStore} from './store';

interface IDatasourceConfigCacheType {
    tableId: string;
    theme: 'light' | 'dark' | 'primary';
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
        theme: 'light',
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

    async function loadAllRecordsForTable(table: ITable): Promise<IRecord[]> {
        let allRecords: IRecord[] = [];
        // 分页加载，每次加载 5000 条 直到加载完数据
        const loadRecordsByPage = async (lastRecordId: string) => {
            const { hasMore , records } = await table.getRecords({ pageSize: 5000 , pageToken: lastRecordId });
            allRecords.push(...records)
            if (hasMore) {
                const last = allRecords[allRecords.length - 1];
                await loadRecordsByPage(last.recordId)
            }
        }
        await loadRecordsByPage('');
        return allRecords;
    }

    function filterRecordsByInfo(allRecords: IRecord[],
                                 verticalField: any | null,
                                 verticalType: 'up' | 'middle' | 'down',
                                 horizontalField: any | null,
                                 horizontalType: 'left' | 'middle' | 'right',
    ): IRecord[] {
        let filteredRecord = []
        if (verticalField) {
            let optionIds = datasourceConfigCache.verticalCategories[verticalType] ?? [];
            filteredRecord = allRecords.filter(item => optionIds.some(id => {
                const itemFieldInfo = item.fields[horizontalField.id]
                const itemId = itemFieldInfo ? itemFieldInfo['id'] : ''
                return id === itemId
            }))
        }
        if (horizontalField) {
            let optionIds = datasourceConfigCache.horizontalCategories[horizontalType] ?? [];
            filteredRecord = allRecords.filter(item => optionIds.some(id => {
                const itemFieldInfo = item.fields[horizontalField.id]
                const itemId = itemFieldInfo ? itemFieldInfo['id'] : ''
                return id === itemId
            }))
        }
        if (!verticalField || !horizontalField) {
            console.log('组装数据错误，缺失横轴或则竖轴字段')
        }
        return [...filteredRecord]
    }

    function groupRecordsByInfo(records: IRecord[],
                                groupField: any | null,
                                groupTexts: string[]

    ): { category: string, persons: IRecord[] }[] {
        console.log('group record-----------------------',records, groupTexts)
        if (!groupField) {
            return [{ category: '', persons: records }]
        }
        let groupList: { category: string, persons: IRecord[] }[] = []
        groupTexts.forEach(text => {
            let filteredList = records.filter(item => {
                let itemFieldInfo = ((item.fields[groupField.id]) instanceof Array) ? (item.fields[groupField.id] as any[])[0] : (item.fields[groupField.id]);
                const itemText = itemFieldInfo ? itemFieldInfo['text'] : ''
                return text === itemText
            })
            groupList.push({ category: text, persons: filteredList })
        });
        return groupList
    }

    function fieldTextKey(type: number): string {
        if (type === 11) {
            // user
            return "name";
        }
        return 'text'
    }

    function mapRecordByDisplayInfo(groupedRecords: { category: string, persons: IRecord[] }[],
                                    personnelField: any | null): { list: { category: string, persons: string[] }[], total: number, percent: number } {
        let displayInfo: { category: string, persons: string[] }[] = [];
        groupedRecords.filter(group => group.persons.length > 0).forEach(group => {
           let list = [];
           group.persons.forEach(item => {
               let itemFieldInfo = ((item.fields[personnelField.id]) instanceof Array) ? (item.fields[personnelField.id] as any[])[0] : (item.fields[personnelField.id]);
               const fieldKey = fieldTextKey(personnelField.type);
               const itemText = itemFieldInfo ? itemFieldInfo[fieldKey] : ''
               if (itemText) list.push(itemText)
           })
            displayInfo.push({ category: group.category, persons: list })
        });
        const list = displayInfo.filter(item => item.persons.length > 0)
        const total = list.map(item => item.persons).flat().length
        return { total, percent: Math.floor((total*100)/datasource.totalRowCount), list };
    }

    function groupTextsFor(records: IRecord[],
                           groupField: any | null
                           ): string[] {
        if (!groupField) {
            return [];
        }
        if (groupField.type === 3) {
            return (groupField.property?.options ?? []).map(item => item.text);
        }
        let map = {};
        records.forEach(item => {
            let fieldInfo = ((item.fields[groupField.id]) instanceof Array) ? (item.fields[groupField.id] as any[])[0] : (item.fields[groupField.id]);
            let text = fieldInfo ? fieldInfo['text']: '';
            if (text?.length) {
                map[text] = text;
            }
        })
        return Object.keys(map);
    }

    async function prepareData(table: ITable) {
        const fields = await table.getFieldMetaList()
        console.log('prepare data fields',fields);
        // 获取数据
        const allRecords = await loadAllRecordsForTable(table)
        console.log('加载完当前 table 所以记录 ', allRecords,)
        datasource.totalRowCount = allRecords.length
        // 根据配置面板数据准备数据
        // 数据根据 四个字段进行组装显示
        let personField = fields.find(item => item.id === datasourceConfigCache.personnelField)
        let groupField = fields.find(item => item.id === datasourceConfigCache.groupField)
        let verticalField = fields.find(item => item.id === datasourceConfigCache.verticalField)
        let horizontalField = fields.find(item => item.id === datasourceConfigCache.horizontalField)
        const groupText = groupTextsFor(allRecords, groupField)
        // console.log(personField, groupField, verticalField, horizontalField, datasourceConfigCache, groupText)
        // 九个格子的数据未分组的数据数组
        let leftUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'left');
        let leftUpGroupList = groupRecordsByInfo(leftUpList, groupField, groupText);
        datasource.leftUpValue = mapRecordByDisplayInfo(leftUpGroupList, personField)

        let middleUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'middle');
        let middleUpGroupList = groupRecordsByInfo(middleUpList, groupField, groupText)
        datasource.middleUpValue = mapRecordByDisplayInfo(middleUpGroupList, personField)

        let rightUpList = filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'right');
        let rightUpGroupList = groupRecordsByInfo(rightUpList, groupField, groupText)
        datasource.rightUpValue = mapRecordByDisplayInfo(rightUpGroupList, personField)

        let leftMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'left');
        let leftMiddleGroupList = groupRecordsByInfo(leftMiddleList, groupField, groupText)
        datasource.leftMiddleValue = mapRecordByDisplayInfo(leftMiddleGroupList, personField)

        let middleMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'middle');
        let middleMiddleGroupList = groupRecordsByInfo(middleMiddleList, groupField, groupText)
        datasource.middleMiddleValue = mapRecordByDisplayInfo(middleMiddleGroupList, personField)

        let rightMiddleList = filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'right');
        let rightMiddleGroupList = groupRecordsByInfo(rightMiddleList, groupField, groupText)
        datasource.rightMiddleValue = mapRecordByDisplayInfo(rightMiddleGroupList, personField)

        let leftDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'left');
        let leftDownGroupList = groupRecordsByInfo(leftDownList, groupField, groupText)
        datasource.leftDownValue = mapRecordByDisplayInfo(leftDownGroupList, personField)

        let middleDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'middle');
        let middleDownGroupList = groupRecordsByInfo(middleDownList, groupField, groupText)
        datasource.middleDownValue = mapRecordByDisplayInfo(middleDownGroupList, personField)

        let rightDownList = filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'right');
        let rightDownGroupList = groupRecordsByInfo(rightDownList, groupField, groupText)
        datasource.rightDownValue = mapRecordByDisplayInfo(rightDownGroupList, personField)
        updateDatasource({...datasource})
    }

    async function initConfigData(id: string | null) {
        console.log('-----------------------------------------------更新表格数据', id, dashboard.state);
        const tableIdList = await base.getTableList();
        // console.log('获取表 id 列表: ',tableIdList)
        const tableList = await Promise.all(getTableList(tableIdList));
        // console.log('获取所有表: ',tableList);
        datasource.tables = [...tableList];
        const tableId = id ? id : tableList[0].tableId;
        datasource.tableId = tableId;
        datasourceConfig.tableId = tableId
        datasourceConfigCache.tableId = tableId
        const table = await base.getTable(tableId);
        // console.log('获取当前选中的表',table)
        const fields = await table.getFieldMetaList()
        datasource.fields[tableId] = [...fields];
        // console.log('获取选中表的所有字段信息: ',datasource.fields);
        datasource.dataRanges = await dashboard.getTableDataRange(tableId)
        // console.log('获取表数据范围: ',ranges);
        // 如果不是创建面板，则根据 自定义配置组装数据
        if (dashboard.state !== DashboardState.Create) {
            await prepareData(table);
        }
        console.log('------------------------------------------------------数据已经准备好: ',datasource, new Date().toISOString())
        // 强制刷新
        setIsLoading(false)
    }

    useEffect(() => {
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
            isLoading ? (<div>加载中...</div>) : (<div className="flex h-full">
                <NineSquaresGrid/>
                {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
                    <ConfigPanel/>
                ) : null}
            </div>)
        )}
    </div>
}

export default App
