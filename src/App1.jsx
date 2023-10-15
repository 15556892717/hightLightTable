import React, { useCallback, useMemo, useRef, useState } from "react";
import styles from "./App.css";
import { Table, Button } from "antd";

const HighlightTable = (props) => {
  const { hoverColor, columns = [], ...res } = props;
  const [highlightedColumn, setHighlightedColumn] = useState(null);
  const [highlightedParentColumns, setHighlightedParentColumns] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);

  const columnsRef = useRef(columns);

  const parentColumnsMap = useMemo(() => {
    const map = new Map();
    for (const column of columnsRef.current) {
      if (column.children) {
        for (const child of column.children) {
          map.set(child.dataIndex, column.dataIndex);
        }
      }
    }
    return map;
  }, []);

  const handleMouseEnter = useCallback((column) => {
    setHighlightedColumn(column);
    setHighlightedParentColumns(getAllParentColumns(column));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHighlightedColumn(null);
    setHighlightedParentColumns([]);
  }, []);

  const addPropToTreeData = useCallback(
    (data, highlightedColumn, highlightedParentColumns) => {
      return data.map((item) => {
        if (!item.onCell) {
          item.onCell = () => {
            return {
              onMouseEnter: () => handleMouseEnter(item.dataIndex),
              onMouseLeave: handleMouseLeave,
              className:
                highlightedColumn === item?.dataIndex ? `col_hover` : "",
            };
          };
        }
        if (!item.onHeaderCell) {
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
        }

        // 如果当前项有子项，则递归调用函数
        if (item.children && item.children.length > 0) {
          if (item?.expanded) {
            item.children1 = item.children;
            item.children = addPropToTreeData(
              item.children1,
              highlightedColumn,
              highlightedParentColumns
            );
          } else {
            item.children1 = item.children;
            item.children = [];
          }
        }

        return item;
      });
    },
    [handleMouseEnter, handleMouseLeave]
  );

  const expandedColumn = useCallback(
    (data, highlightedColumn, highlightedParentColumns) => {
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
          item.children1 = expandedColumn(
            item.children1,
            highlightedColumn,
            highlightedParentColumns
          );
        }
        return item;
      });
    },
    [handleExpand]
  );

  useMemo(() => {
    const addPropFunc = addPropToTreeData(
      columnsRef.current,
      highlightedColumn,
      highlightedParentColumns
    );
    const expandedFunc = expandedColumn(
      addPropFunc,
      highlightedColumn,
      highlightedParentColumns
    );

    setCustomColumns(expandedFunc);
  }, [
    addPropToTreeData,
    columnsRef,
    expandedColumn,
    highlightedColumn,
    highlightedParentColumns,
  ]);

  const handleExpand = useCallback(
    (dataIndex) => {
      const columns = columnsRef.current || [];
      // 查找要展开或收起的列头
      const column = findColumn(columns, dataIndex);
      // 如果该列头存在，并且有子集，则进行展开/收起操作
      if (column && column.children) {
        column.expanded = !column.expanded;

        let newColumns = [...columns];
        updateColumnExpandStatus(newColumns, dataIndex, column.expanded);
        const addPropFunc = addPropToTreeData(
          newColumns,
          highlightedColumn,
          highlightedParentColumns
        );
        const expandedFunc = expandedColumn(
          addPropFunc,
          highlightedColumn,
          highlightedParentColumns
        );

        setCustomColumns(expandedFunc);
      }
    },
    [
      addPropToTreeData,
      columnsRef,
      expandedColumn,
      handleMouseEnter,
      handleMouseLeave,
      highlightedColumn,
      highlightedParentColumns,
    ]
  );

  function getAllParentColumns(column) {
    let parents = [];
    let parent = parentColumnsMap.get(column);
    while (parent) {
      parents.push(parent);
      parent = parentColumnsMap.get(parent);
    }
    return parents;
  }

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

  const updateColumnExpandStatus = useCallback(
    (columns, dataIndex, isExpanded) => {
      for (const column of columns) {
        if (column.dataIndex === dataIndex) {
          column.expanded = isExpanded;
          if (column.children && column.children.length > 0) {
            updateColumnExpandStatus(column.children, dataIndex, isExpanded);
          }
          break;
        }
      }
    },
    []
  );

  return (
    <Table
      dataSource={res?.dataSource}
      columns={customColumns}
      bordered
      pagination={false}
      {...res}
    />
  );
};

export default HighlightTable;
