import styles from './Table.module.css';

export default function Table({ columns, data = [], keyField = 'id', actions, loading }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={styles.th}>{col.label}</th>
            ))}
            {actions && <th className={styles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex} className={styles.tr}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={styles.td}>
                    <div className={`${styles.skeletonBar} ${styles.shim}`}></div>
                  </td>
                ))}
                {actions && (
                  <td className={styles.td}>
                    <div className={`${styles.skeletonBar} ${styles.shim}`} style={{ width: '80px' }}></div>
                  </td>
                )}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyCell}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className={styles.tr}>
                {columns.map((col, i) => (
                  <td key={i} className={styles.td}>
                    {col.render ? col.render(row) : row[col.field]}
                  </td>
                ))}
                {actions && (
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
