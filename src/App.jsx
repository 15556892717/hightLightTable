import React, { useCallback, useMemo, useRef, useState } from "react";
import styles from "./App.css";
import { Table, Button } from "antd";

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
  const handleMouseEnter = (column) => {
    setHighlightedColumn(column);
    const parentColumn = getAllParentColumns(column); // 获取当前列的父级列
    setHighlightedParentColumns(parentColumn);
  };

  const handleMouseLeave = () => {
    setHighlightedColumn(null);
    setHighlightedParentColumns(null);
  };

  function addPropToTreeData(data) {
    return data.map((item) => {
      item.onCell = () => {
        return {
          onMouseEnter: () => handleMouseEnter(item.dataIndex),
          onMouseLeave: handleMouseLeave,
          className: highlightedColumn === item?.dataIndex ? `col_hover` : "",
        };
      };

      item.onHeaderCell = (column) => {
        return {
          onMouseEnter: () => handleMouseEnter(column.dataIndex),
          onMouseLeave: handleMouseLeave,
          style: {
            [highlightedColumn === item.dataIndex ||
            highlightedParentColumns?.includes(item.dataIndex)
              ? "background"
              : ""]: "#e8f1ff",
          },
        };
      };

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

  return (
    <Table
      dataSource={res?.dataSource}
      columns={customColumns}
      bordered
      {...res}
    />
  );
};

export default HighlightTable;
