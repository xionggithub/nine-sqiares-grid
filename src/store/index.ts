import { create } from 'zustand';

export interface IDatasourceType {
  // 所有表对象
  tables: any[];
  //选中
  tableId: string;
  fields: { [key: string]: any[] };
  dataRanges: { type:string; viewId:string; viewName: string; viewType: number; }[]
  leftDownValue: any[],
  middleDownValue: any[],
  rightDownValue: any[],
  leftMiddleValue: any[],
  middleMiddleValue: any[],
  rightMiddleValue: any[],
  leftUpValue: any[],
  middleUpValue: any[],
  rightUpValue: any[],
}

interface IDatasourceStore {
  datasource: IDatasourceType;
  updateDatasource: (typeConfig: IDatasourceStore) => void;
}

export const useDatasourceStore = create<IDatasourceStore>((set) => ({
  datasource: {
    tables: [],
    tableId: '',
    fields: {},
    dataRanges: [],
    leftDownValue: [],
    middleDownValue: [],
    rightDownValue: [],
    leftMiddleValue: [],
    middleMiddleValue: [],
    rightMiddleValue: [],
    leftUpValue: [],
    middleUpValue: [],
    rightUpValue: [],
  },
  updateDatasource: (datasource) => set(() => ({ datasource })),
}));



export interface IDatasourceConfigType {
  tableId: string;
  theme: 'light' | 'dark' | 'primary';
  dataRange: string;
  personnel: string;
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
  group: string;
}

interface IDatasourceConfigStore {
  datasourceConfig: IDatasourceConfigType;
  updateDatasourceConfig: (typeConfig: IDatasourceConfigStore) => void;
}

export const useDatasourceConfigStore = create<IDatasourceConfigStore>((set) => ({
  datasourceConfig: {
    tableId: '',
    theme: 'light',
    dataRange: '',
    personnel: '',
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
    group: ''
  },
  updateDatasourceConfig: (datasourceConfig) => set(() => ({ datasourceConfig })),
}));

export interface ITextConfigType {
  HLeftValue: string,
  HMiddleValue: string,
  HRightValue: string,
  VUpValue: string,
  VMiddleValue: string,
  VDownValue: string,
  leftDownValue: string,
  middleDownValue: string,
  rightDownValue: string,
  leftMiddleValue: string,
  middleMiddleValue: string,
  rightMiddleValue: string,
  leftUpValue: string,
  middleUpValue: string,
  rightUpValue: string,
}

interface ITextConfigStore {
  textConfig: ITextConfigType;
  updateTextConfig: (styleConfig: ITextConfigType) => void;
}

export const useTextConfigStore = create<ITextConfigStore>((set) => ({
  textConfig: {
    HLeftValue: '',
    HMiddleValue: '',
    HRightValue: '',
    VUpValue: '',
    VMiddleValue: '',
    VDownValue: '',
    leftDownValue: '',
    middleDownValue: '',
    rightDownValue: '',
    leftMiddleValue: '',
    middleMiddleValue: '',
    rightMiddleValue: '',
    leftUpValue: '',
    middleUpValue: '',
    rightUpValue: '',
  },
  updateTextConfig: (textConfig: ITextConfigType) =>
    set(() => ({ textConfig })),
}));
