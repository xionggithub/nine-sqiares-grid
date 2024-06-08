import {useCallback, useEffect, useState} from 'react';
import {NineSquaresGrid} from "./components/nineSquaresGrid";
import {ConfigPanel} from "./components/configPanel";
import {base, dashboard, DashboardState, IDataRange} from "@lark-base-open/js-sdk";
import {useDatasourceConfigStore, useDatasourceStore, useTextConfigStore} from './store';
import {flushSync} from "react-dom"

export interface ITableSource {
    tableId: string;
    tableName: string;
}


function App() {

    const { datasource } = useDatasourceStore((state) => state);

    // 类型与数据
    const { updateDatasourceConfig } = useDatasourceConfigStore((state) => state);

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

    async function initConfigData(id: string | null) {
        console.log('-----------------------------------------------更新表格数据', id, dashboard.state);
        const tableIdList = await base.getTableList();
        console.log('tablelist for feishu: ',tableIdList)
        const tableList = await Promise.all(getTableList(tableIdList));
        console.log('tableList: ',tableList);
        datasource.tables = [...tableList];
        const tableId = id ? id : tableList[0].tableId;
        datasource.tableId = tableId;
        const table = await base.getTable(tableId);
        console.log('-----',table)
        const fields = await table.getFieldMetaList()
        datasource.fields[tableId] = [...fields];
        console.log('datasource: ',datasource.fields);
        console.log('isload: ',datasource, new Date().toISOString())
        const ranges = await dashboard.getTableDataRange(tableId)
        datasource.dataRanges = ranges
        console.log('table data range: ',ranges);
        // 强制刷新
        flushSync(() => {
            setIsLoading(false)
        })
        return
    }

    useEffect(() => {
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
  //               tableSource={tableSource}
  //               dataRange={dataRange}
  //               categories={categories}
  //               getTableConfig={initConfigData}
  //             />
  //       ) : null}
  //   </div>
  // )


    return <div>
        {(
            isLoading ? (<div>加载中...</div>) : (<div className="flex h-full">
                <NineSquaresGrid/>
                <ConfigPanel
                    tableSource={tableSource}
                    dataRange={dataRange}
                    categories={categories}
                    getTableConfig={initConfigData}
                />
            </div>)
        )}
    </div>
}

export default App
