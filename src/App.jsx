import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import styles from "./App.css";
import { Table, Button } from "antd";
import { unparse } from "papaparse";
import { getClosest } from "./utilss";
import styled from "styled-components";

const HighlightTable = (props) => {
  const { hoverColor, columns = [], ...res } = props;
  const [highlightedColumn, setHighlightedColumn] = useState(null);
  const [highlightedParentColumns, setHighlightedParentColumns] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const customColumnsRef = useRef(null);

  function getAllParentColumns(column) {
    let parents = [];
    parents = findParentColumns(columns, column);
    parents = parents?.map((i) => i?.dataIndex);
    return parents;
  }

  function findParentColumns(data, childDataIndex) {
    for (const item of data) {
      if (item.dataIndex === childDataIndex) {
        return [item];
      }
      if (item.children) {
        const result = findParentColumns(item.children, childDataIndex);
        if (result) {
          return [item, ...result];
        }
      }
    }
    return null;
  }
  const handleMouseEnter = (column, e) => {
    // console.log(e, "111111");
    e.target.classList.add("hover");
    // console.log(e.target.classList, "e.target.classList");
    // console.log(123, column);
    setHighlightedColumn(column);
    const parentColumn = getAllParentColumns(column); // 获取当前列的父级列
    setHighlightedParentColumns(parentColumn);
  };

  const handleMouseLeave = (e) => {
    e.target.classList.remove("hover");
    setHighlightedColumn(null);
    setHighlightedParentColumns(null);
  };

  function addPropToTreeData(data) {
    return data.map((item) => {
      // const className =
      //   highlightedColumn === item?.dataIndex ? `col_hover` : "";
      // if (!item?.onCell) {
      //   console.log(item, "item");
      item.onCell = () => {
        return {
          // onMouseEnter: (e) => handleMouseEnter(item.dataIndex, e),
          // onMouseLeave: handleMouseLeave,
          // className: className,
          col_hover: item.dataIndex,
        };
        // };
      };
      // const style = {
      //   [highlightedColumn === item.dataIndex ||
      //   highlightedParentColumns?.includes(item.dataIndex)
      //     ? "background"
      //     : ""]: "#e8f1ff",
      // };
      if (!item?.onHeaderCell) {
        item.onHeaderCell = (column) => {
          return {
            // onMouseEnter: (e) => handleMouseEnter(column.dataIndex, e),
            // onMouseLeave: handleMouseLeave,
            // style: style,
          };
        };
      }

      // 如果当前项有子项，则递归调用函数
      if (item.children && item.children.length > 0) {
        if (item?.expanded) {
          item.children1 = item.children;
          item.children = addPropToTreeData(item.children1);
        } else {
          item.children1 = item.children;
          item.children = [];
        }
      }

      return item;
    });
  }

  const expandedColumn = (data) => {
    return data.map((item) => {
      if (item.expanded) {
        item.children = item.children1;
      } else {
        item.children = [];
      }
      if (item.children1 && item.children1.length > 0) {
        if (item.expanded) {
          item.title =
            typeof item.title === "string" ? (
              <>
                {item.title}
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleExpand(item.dataIndex)}
                >
                  {item.expanded ? "收起" : "展开"}
                </Button>
              </>
            ) : item.title?.props?.children?.length > 1 ? (
              <>
                {item?.title?.props?.children[0]}
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleExpand(item.dataIndex)}
                >
                  收起
                </Button>
              </>
            ) : (
              item.title
            );
        } else {
          item.title =
            typeof item.title === "string" ? (
              <>
                {item.title}
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleExpand(item.dataIndex)}
                >
                  {item.expanded ? "收起" : "展开"}
                </Button>
              </>
            ) : item.title?.props?.children?.length ? (
              <>
                {item.title.props.children[0]}
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleExpand(item.dataIndex)}
                >
                  展开
                </Button>
              </>
            ) : (
              item.title
            );
        }
        item.children1 = expandedColumn(item.children1);
      }
      return item;
    });
  };

  useMemo(() => {
    let newColumns = addPropToTreeData(columns);
    newColumns = expandedColumn(newColumns);
    customColumnsRef.current = newColumns;
    setCustomColumns(newColumns);
  }, [columns, highlightedColumn, highlightedParentColumns]);

  const handleExpand = (dataIndex) => {
    const columns = customColumnsRef?.current || [];
    // 查找要展开或收起的列头
    const column = findColumn(columns, dataIndex);
    // 如果该列头存在，并且有子集，则进行展开/收起操作
    if (column && column.children) {
      column.expanded = !column.expanded;

      let newColumns = [...columns];
      updateColumnExpandStatus(newColumns, dataIndex, column.expanded);
      newColumns = expandedColumn(newColumns);
      setCustomColumns(newColumns);
    }
  };

  function findColumn(data, dataIndex) {
    for (const item of data) {
      if (item.dataIndex === dataIndex) {
        return item;
      }
      if (item.children) {
        const result = findColumn(item.children, dataIndex);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  const updateColumnExpandStatus = (columns, dataIndex, isExpanded) => {
    for (const column of columns) {
      if (column.dataIndex === dataIndex) {
        column.expanded = isExpanded;
        if (column.children && column.children.length > 0) {
          updateColumnExpandStatus(column.children, dataIndex, isExpanded);
        }
        break;
      }
    }
  };

  const handleDownloadCSV = React.useCallback(() => {
    const dataSource = res.dataSource;
    if (!dataSource) {
      return;
    }

    const data = dataSource;

    console.log("data:", data);
    const csv = unparse(data, {
      skipEmptyLines: "greedy",
      header: true,
      ...{},
    });
    console.log(csv, "csv");
    const blob = new Blob([csv]);
    const a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `${false || "table"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [res]);
  const preCellRef = useRef(null);
  const [colHoverKey, setHoverKey] = useState("");
  const findEventTarget = (e) => {
    const target = getClosest(e.target, `td.ant-table-cell`);
    const colIndex = target && target.getAttribute("col_hover");
    const cells = document.querySelectorAll(
      `td.ant-table-cell[col_hover=${colIndex}]`
    );
    cells.forEach((cell) => {
      cell.classList.add("col_hover");
    });
    // setHoverKey(colIndex);

    try {
      // in case of finding an unmounted component due to cached data
      // need to clear refs of this.tableInc when dataSource Changed
      // in virtual table
      return {
        colIndex,
      };
    } catch (error) {
      return {};
    }

    return {};
  };

  useEffect(() => {
    const table = document.querySelector(".ant-table-tbody");
    table.addEventListener("mouseover", (e) => {
      const cells = document.querySelectorAll(`td.ant-table-cell`);
      cells.forEach((cell) => {
        cell.classList.remove("col_hover");
      });
      // console.log(e, "table");
      preCellRef.current = getClosest(e.target, `td.ant-table-cell`);
      findEventTarget(e);
    });
    return () => {};
  }, []);
  // console.log(colHoverKey, "colHoverKey");

  return (
    <>
      <button
        onClick={() => {
          handleDownloadCSV();
        }}
      >
        anniu{" "}
      </button>
      <Table
        style={{
          "--col_hover": colHoverKey,
        }}
        dataSource={res?.dataSource}
        columns={customColumns}
        pagination={false}
        colHoverKey={colHoverKey}
        bordered
        {...res}
      ></Table>
      {/* <Table /> */}
    </>
  );
};

export default HighlightTable;
