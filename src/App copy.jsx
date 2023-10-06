import React, { useState } from "react";
import HightTable from "./App";
import { Button } from "antd";

export default function App() {
  const [columns, setcolumns] = useState([
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      fixed: "left",
      filters: [
        {
          text: "Joe",
          value: "Joe",
        },
        {
          text: "John",
          value: "John",
        },
      ],
    },
    {
      title: "Other",
      dataIndex: "other",
      expanded: true,
      children: [
        {
          title: "Age",
          dataIndex: "age",
          key: "age",
          width: 150,
          sorter: (a, b) => a.age - b.age,
        },
        {
          title: "Address",
          dataIndex: "address",
          expanded: true,
          children: [
            {
              title: "Street",
              dataIndex: "street",
              key: "street",
              width: 150,
            },
            {
              title: "Block",
              dataIndex: "block",
              expanded: false,
              children: [
                {
                  title: "Building",
                  dataIndex: "building",
                  key: "building",
                  width: 100,
                },
                {
                  title: "Door No.",
                  dataIndex: "number",
                  key: "number",
                  width: 100,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Company",
      dataIndex: "company",
      expanded: true,
      children: [
        {
          title: "Company Address",
          dataIndex: "companyAddress",
          key: "companyAddress",
          width: 200,
        },
        {
          title: "Company Name",
          dataIndex: "companyName",
          key: "companyName",
        },
      ],
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      fixed: "right",
    },
  ]);
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i,
      name: "John Brown",
      age: i + 1,
      street: "Lake Park",
      building: "C",
      number: 2035,
      companyAddress: "Lake Street 42",
      companyName: "SoftLake Co",
      gender: "M",
    });
  }
  const dataSource = [
    {
      key: "1",
      name: "胡彦斌",
      age: 32,
      address: "西湖区湖底公园1号",
    },
    {
      key: "2",
      name: "胡彦祖",
      age: 42,
      address: "西湖区湖底公园1号",
    },
  ];

  const columns1 = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "年龄",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "住址",
      dataIndex: "address",
      key: "address",
    },
  ];

  const expandAll = (columns) => {
    return columns.map((i) => {
      i.expanded = true;
      if (i?.children1) {
        i.children = expandAll(i.children1);
      }
      return i;
    });
  };

  //打开所有层级
  const handleClick = () => {
    setcolumns(expandAll(columns));
  };

  return (
    <div>
      <Button onClick={handleClick}>全部展开</Button>
      <HightTable dataSource={data} columns={columns}></HightTable>
    </div>
  );
}
