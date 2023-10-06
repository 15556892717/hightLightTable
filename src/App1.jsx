import React, { useCallback, useMemo, useState } from "react";
import { Table, Button } from "antd";

const HighlightTable = (props) => {
  const { hoverColor, columns = [], ...res } = props;
  const [highlightedColumn, setHighlightedColumn] = useState(null);
  const [highlightedParentColumns, setHighlightedParentColumns] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);

  function getAllParentColumns(column) {
    let parents = [];
    parents = findParentColumns(columns, column);
    parents = parents.map((i) => i?.dataIndex);
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
    const parentColumn = getAllParentColumns(column);
    setHighlightedParentColumns(parentColumn);
  };

  const handleMouseLeave = () => {
    setHighlightedColumn(null);
    setHighlightedParentColumns([]);
  };

  const toggleExpand = useCallback(
    (column) => {
      const customColumns = addPropToTreeData(columns);
      const newColumns = [...customColumns];
      const targetColumn = findColumn(newColumns, column.dataIndex);
      if (targetColumn) {
        targetColumn.expanded = !targetColumn.expanded;
        updateColumnExpandStatus(
          newColumns,
          column.dataIndex,
          targetColumn.expanded
        );
        console.log(newColumns, "newColumns");
        setCustomColumns(newColumns);
      }
    },
    [columns]
  );

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

  const addPropToTreeData = (data) => {
    return data.map((item) => {
      // 为每个列头添加展开/收起按钮

      // 设置单元格的样式和事件监听器
      item.onCell = (record) => {
        return {
          onMouseEnter: () => handleMouseEnter(item.dataIndex),
          onMouseLeave: handleMouseLeave,
          className: highlightedColumn === item.dataIndex ? "col_hover" : "",
        };
      };

      // 设置列头的样式和事件监听器
      item.onHeaderCell = (column) => {
        return {
          onMouseEnter: () => handleMouseEnter(column.dataIndex),
          onMouseLeave: handleMouseLeave,
          style: {
            background:
              highlightedColumn === item.dataIndex ||
              highlightedParentColumns.includes(item.dataIndex)
                ? "#e8f1ff"
                : "",
          },
        };
      };

      // 递归处理子列
      if (item.children && item.children.length > 0) {
        item.title =
          typeof item.title === "string" ? (
            <>
              {item.title}
              <Button
                type="link"
                size="small"
                onClick={() => toggleExpand(item)}
              >
                {item.expanded ? "收起" : "展开"}
              </Button>
            </>
          ) : (
            item.title
          );
        if (item?.expanded) {
          item.children1 = item.children;
          item.children = addPropToTreeData(item.children1);
        } else {
          item.children1 = item.children;
          item.children = [];
        }
        // item.expandable = {
        //   expanded: item.expanded !== false,
        //   onExpand: (expanded, record) => {
        //     handleExpand(item.dataIndex, expanded);
        //   },
        // };
      }

      return item;
    });
  };

  const handleExpand = (dataIndex, isExpanded) => {
    const column = findColumn(customColumns, dataIndex);
    if (column && column.children) {
      const newColumns = [...customColumns];
      updateColumnExpandStatus(newColumns, dataIndex, isExpanded);
      setCustomColumns(newColumns);
    }
  };

  useMemo(() => {
    const newColumns = addPropToTreeData(columns);
    setCustomColumns(newColumns);
  }, [columns, highlightedColumn, highlightedParentColumns]);

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
