import React from 'react';
import { Table } from 'antd';

const sort = () => {
  console.log('sort');
}
//冒泡排序
const bubbleSort = (arr) => { // 从小到大排序 
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - (i + 1); j++) {
      if (arr[j] > arr[j + 1]) { // 相邻元素两两对比
        let temp = arr[j + 1]; // 元素交换
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
}

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: "address"
  }
];

const data = [
  { name: '张三', age: '20', address: '北京市海淀区中关村' },
  { name: '李四', age: '25', address: '上海市浦东新区世纪大道' },
  { name: '王五', age: '30', address: '广州市天河区珠江新城' }
];

//用antd写一个表格,表格支持行列拖拽进行排序
function TableSort () {
  return (
    <Table
      dataSource={data}
      columns={columns}
      onRow={(record, index) => {
        return {
          index: index,
          moveRow: (fromIndex, toIndex) => {
            const newData = [...data];
            newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
            data = newData;
          }
        };
      }}
    />
  );
}


// function App () {
//   return <Table dataSource={data} columns={columns} />;
// }

export default TableSort;