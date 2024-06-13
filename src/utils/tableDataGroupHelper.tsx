import { IRecord, ITable } from "@lark-base-open/js-sdk";

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
}
