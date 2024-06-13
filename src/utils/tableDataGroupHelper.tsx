import { IRecord, ITable } from "@lark-base-open/js-sdk";

export interface IDatasourceConfigCacheType {
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

export class TableDataGroupHelper {

    async loadAllRecordsForTable(table: ITable): Promise<IRecord[]> {
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

    groupRecordsByInfo(records: IRecord[],
                                groupField: any | null,
                                groupTexts: string[]

    ): { category: string, persons: IRecord[] }[] {
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

    groupTextsFor(records: IRecord[],
                           groupField: any | null
    ): string[] {
        if (!groupField) {
            return [];
        }
        if (groupField.type === 3) {
            return (groupField.property?.options ?? []).map(item => (item.name ? item.name : item.text));
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

    fieldTextKey(type: number): string {
        if (type === 11) {
            // user
            return "name";
        }
        return 'text'
    }

    mapRecordByDisplayInfo(groupedRecords: { category: string, persons: IRecord[] }[],
                           personnelField: any | null,
                           datasource: any
    ): { list: { category: string, persons: string[] }[], total: number, percent: number } {
        console.log('--------',groupedRecords, personnelField)
        let displayInfo: { category: string, persons: string[] }[] = [];
        groupedRecords.filter(group => group.persons.length > 0).forEach(group => {
            let list = [];
            group.persons.forEach(item => {
                let itemFieldInfo = ((item.fields[personnelField.id]) instanceof Array) ? (item.fields[personnelField.id] as any[])[0] : (item.fields[personnelField.id]);
                const fieldKey = this.fieldTextKey(personnelField.type);
                const itemText = itemFieldInfo ? itemFieldInfo[fieldKey] : ''
                if (itemText) list.push(itemText)
            })
            displayInfo.push({ category: group.category, persons: list })
        });
        const list = displayInfo.filter(item => item.persons.length > 0)
        const total = list.map(item => item.persons).flat().length
        console.log(list, displayInfo, total)
        return { total, percent: Math.floor((total*100)/datasource.totalRowCount), list };
    }


    filterRecordsByInfo(allRecords: IRecord[],
                                 verticalField: any | null,
                                 verticalType: 'up' | 'middle' | 'down',
                                 horizontalField: any | null,
                                 horizontalType: 'left' | 'middle' | 'right',
                                 datasourceConfigCache: any
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

    async prepareData(table: ITable, datasource: any,  datasourceConfigCache: any) {
        const fields = await table.getFieldMetaList()
        console.log('prepare data fields',fields);
        // 获取数据
        const allRecords = await  this.loadAllRecordsForTable(table)
        console.log('加载完当前 table 所以记录 ', allRecords,)
        datasource.totalRowCount = allRecords.length
        datasource.allRecords[table.id] = allRecords
        // 根据配置面板数据准备数据
        // 数据根据 四个字段进行组装显示
        let personField = fields.find(item => item.id === datasourceConfigCache.personnelField)
        let groupField = fields.find(item => item.id === datasourceConfigCache.groupField)
        let verticalField = fields.find(item => item.id === datasourceConfigCache.verticalField)
        let horizontalField = fields.find(item => item.id === datasourceConfigCache.horizontalField)
        const groupText = this.groupTextsFor(allRecords, groupField)
        console.log(personField, groupField, verticalField, horizontalField, datasourceConfigCache, groupText)
        // 九个格子的数据未分组的数据数组
        let leftUpList = this.filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'left', datasourceConfigCache);
        let leftUpGroupList = this.groupRecordsByInfo(leftUpList, groupField, groupText);
        datasource.leftUpValue = this.mapRecordByDisplayInfo(leftUpGroupList, personField, datasource)

        let middleUpList = this.filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'middle', datasourceConfigCache);
        let middleUpGroupList = this.groupRecordsByInfo(middleUpList, groupField, groupText)
        datasource.middleUpValue = this.mapRecordByDisplayInfo(middleUpGroupList, personField, datasource)

        let rightUpList = this.filterRecordsByInfo(allRecords, verticalField, 'up', horizontalField, 'right', datasourceConfigCache);
        let rightUpGroupList = this.groupRecordsByInfo(rightUpList, groupField, groupText)
        datasource.rightUpValue = this.mapRecordByDisplayInfo(rightUpGroupList, personField, datasource)

        let leftMiddleList = this.filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'left', datasourceConfigCache);
        let leftMiddleGroupList = this.groupRecordsByInfo(leftMiddleList, groupField, groupText)
        datasource.leftMiddleValue = this.mapRecordByDisplayInfo(leftMiddleGroupList, personField, datasource)

        let middleMiddleList = this.filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'middle', datasourceConfigCache);
        let middleMiddleGroupList = this.groupRecordsByInfo(middleMiddleList, groupField, groupText)
        datasource.middleMiddleValue = this.mapRecordByDisplayInfo(middleMiddleGroupList, personField, datasource)

        let rightMiddleList = this.filterRecordsByInfo(allRecords, verticalField, 'middle', horizontalField, 'right', datasourceConfigCache);
        let rightMiddleGroupList = this.groupRecordsByInfo(rightMiddleList, groupField, groupText)
        datasource.rightMiddleValue = this.mapRecordByDisplayInfo(rightMiddleGroupList, personField, datasource)

        let leftDownList = this.filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'left', datasourceConfigCache);
        let leftDownGroupList = this.groupRecordsByInfo(leftDownList, groupField, groupText)
        datasource.leftDownValue = this.mapRecordByDisplayInfo(leftDownGroupList, personField, datasource)

        let middleDownList = this.filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'middle', datasourceConfigCache);
        let middleDownGroupList = this.groupRecordsByInfo(middleDownList, groupField, groupText)
        datasource.middleDownValue = this.mapRecordByDisplayInfo(middleDownGroupList, personField, datasource)

        let rightDownList = this.filterRecordsByInfo(allRecords, verticalField, 'down', horizontalField, 'right', datasourceConfigCache);
        let rightDownGroupList = this.groupRecordsByInfo(rightDownList, groupField, groupText)
        datasource.rightDownValue = this.mapRecordByDisplayInfo(rightDownGroupList, personField, datasource)
    }
}
