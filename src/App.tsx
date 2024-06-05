import { useEffect, useCallback, useState } from 'react';
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import { DashboardState, dashboard, base, IDataRange } from "@lark-base-open/js-sdk";
import { useDatasourceConfigStore, useTextConfigStore } from './store';

export interface ITableSource {
    tableId: string;
    tableName: string;
}


function App() {

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
        const res = await dashboard.getConfig()
        console.log('get config:', res)

        console.log('更新表格数据', id);
        const tableIdList = await base.getTableList();
        const tableList = await Promise.all(getTableList(tableIdList));

        const tableId = id ? id : tableList[0].tableId;
        const table = await base.getTable(tableId);

        const [tableRanges, categories] = await Promise.all([
            getTableRange(tableId),
            getCategories(table, tableId),
        ]);

        setDataRange([...tableRanges]);

        setCategories([{ id: 'hidden', name: '隐藏', type: -1 }, ...categories]);

        setTableSource([...tableList]);
        const renderRes = await dashboard.setRendered();
        console.log('自动化 渲染通知--->', renderRes, categories);
        return { categories };
    }

    useEffect(() => {
        initConfigData(null).then();
    }, []);

    useEffect(() => {
        async function getConfig() {
            const config = await dashboard.getConfig();
            const { typeConfig, styleConfig } = config.customConfig as any;
            updateDatasourceConfig(typeConfig);
            updateTextConfig(styleConfig);
            initConfigData(typeConfig.tableId).then();

            // console.log('tableMeta---->', tableRanges, categories);
        }
        getConfig().then();

        dashboard.onConfigChange(getConfig);
        // 监控数据变化
        dashboard.onDataChange(getConfig);
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


    return (
      <div className="flex h-full">
          <NineSquaresGrid/>
          <ConfigPanel
              tableSource={tableSource}
              dataRange={dataRange}
              categories={categories}
              getTableConfig={initConfigData}
          />
      </div>
    )
}

export default App
