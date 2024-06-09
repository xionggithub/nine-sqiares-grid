import {useCallback, useEffect, useState} from 'react';
import {NineSquaresGrid} from "./components/nineSquaresGrid";
import {ConfigPanel} from "./components/configPanel";
import {base, dashboard, DashboardState, IDataRange, IRecord, ITable} from "@lark-base-open/js-sdk";
import {useDatasourceConfigStore, useDatasourceStore, useTextConfigStore} from './store';
import {flushSync} from "react-dom"

export interface ITableSource {
    tableId: string;
    tableName: string;
}


function App() {

    const { datasource } = useDatasourceStore((state) => state);

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);

    // 样式配置数据
    const { updateTextConfig } = useTextConfigStore((state) => state);

    // 表格列表
    const [tableSource, setTableSource] = useState<ITableSource[]>([]);

    // 数据范围列表
    const [dataRange, setDataRange] = useState<IDataRange[]>([]);

    // 列名
    const [categories, setCategories] = useState<any>([]);

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

    async function prepareData(table: ITable) {
        // 获取数据
        const allRecords = await loadAllRecordsForTable(table)
        console.log('加载完当前 table 所以记录', allRecords,)
        // 根据配置面板数据准备数据

        let personFieldId = datasourceConfig.personnel

    }

    async function initConfigData(id: string | null) {
        console.log('-----------------------------------------------更新表格数据', id, dashboard.state);
        const tableIdList = await base.getTableList();
        console.log('获取表 id 列表: ',tableIdList)
        const tableList = await Promise.all(getTableList(tableIdList));
        console.log('获取所有表: ',tableList);
        datasource.tables = [...tableList];
        const tableId = id ? id : tableList[0].tableId;
        datasource.tableId = tableId;
        const table = await base.getTable(tableId);
        console.log('获取当前选中的表',table)
        const fields = await table.getFieldMetaList()
        datasource.fields[tableId] = [...fields];
        console.log('获取选中表的所有字段信息: ',datasource.fields);
        const ranges = await dashboard.getTableDataRange(tableId)
        datasource.dataRanges = ranges
        console.log('获取表数据范围: ',ranges);
        // 如果不是创建面板，则根据 自定义配置组装数据
        if (dashboard.state !== DashboardState.Create) {
            await prepareData(table);
        }
        console.log('------------------------------------------------------数据已经准备好: ',datasource, new Date().toISOString())
        // 强制刷新
        setIsLoading(false)
    }

    useEffect(() => {
        console.log('useEffect++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        // 先获取保存的配置数据
        if (dashboard.state !== DashboardState.Create) {
            console.log('load config')
            dashboard.getConfig().then((config) => {
                updateDatasourceConfig(config.customConfig.datasourceConfig)
                updateTextConfig(config.customConfig.textConfig)
                console.log('获取到 config：', config);
                initConfigData(config.customConfig.datasourceConfig.tableId).then();
            })
        } else {
            initConfigData(null).then();
        }
    }, []);

    useEffect(() => {
        async function getConfig() {
            // const config = await dashboard.getConfig();
            // const { typeConfig, styleConfig } = config.customConfig as any;
            // updateDatasourceConfig(typeConfig);
            // updateTextConfig(styleConfig);
            // initConfigData(typeConfig.tableId).then();
            // console.log('tableMeta---->', tableRanges, categories);
        }
        getConfig().then();
        dashboard.onConfigChange(getConfig);
        // 监控数据变化
        dashboard.onDataChange(getConfig);
        console.log('lister change;:::')
    }, []);


  //release

  // return (
  //   <div className="flex h-full">
  //       <NineSquaresGrid/>
  //
  //       {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
  //           <ConfigPanel
  //               getTableConfig={initConfigData}
  //             />
  //       ) : null}
  //   </div>
  // )


    return <div>
        {(
            isLoading ? (<div>加载中...</div>) : (<div className="flex h-full">
                <NineSquaresGrid/>
                <ConfigPanel/>
            </div>)
        )}
    </div>
}

export default App
