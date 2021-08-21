const { Pool } = require('pg');

class GeneralService {
  constructor() {
    this._pool = new Pool();
  }

  async dashboardSummary(companyId) {
    const saleTodayCount = await this._pool.query(
      `SELECT COUNT(id) as sale_count FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE = CURRENT_DATE`,
    );

    const purchaseTodayCount = await this._pool.query(
      `SELECT COUNT(id) as purchase_count FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE = CURRENT_DATE`,
    );

    const saleYesterdayCount = await this._pool.query(
      `SELECT COUNT(id) as sale_count FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE = CURRENT_DATE - 1`,
    );

    const purchaseYesterdayCount = await this._pool.query(
      `SELECT COUNT(id) as purchase_count FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE = CURRENT_DATE - 1`,
    );

    const totalSales = await this._pool.query(`
      SELECT SUM(amount) as sale_total FROM sales WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1)
    `);

    const totalPurchases = await this._pool.query(`
      SELECT SUM(amount) as purchase_total FROM purchases WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1)
    `);

    const graphSale = await this._pool.query(
      `SELECT COUNT(date), date::DATE 
      FROM sales
      WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE
      GROUP BY date::DATE`,
    );

    const graphPurchase = await this._pool.query(
      `SELECT COUNT(date), date::DATE 
      FROM purchases
      WHERE office_id = (SELECT id FROM offices WHERE company_id = '${companyId}' LIMIT 1) AND date::DATE BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE
      GROUP BY date::DATE `,
    );

    const grownSale = (+saleYesterdayCount.rows[0].sale_count - +saleTodayCount.rows[0].sale_count)
      / +saleYesterdayCount.rows[0].sale_count;
    const grownPurchase = (+purchaseYesterdayCount.rows[0].purchase_count
      - +purchaseTodayCount.rows[0].purchase_count)
      / +purchaseYesterdayCount.rows[0].purchase_count;

    return {
      saleCount: saleTodayCount.rows[0].sale_count,
      purchaseCount: purchaseTodayCount.rows[0].purchase_count,
      saleYesterdayCount: saleYesterdayCount.rows[0].sale_count,
      purchaseYesterdayCount: purchaseYesterdayCount.rows[0].purchase_count,
      grownSale,
      grownPurchase,
      graphSale: graphSale.rows,
      graphPurchase: graphPurchase.rows,
      totalSales: totalSales.rows[0].sale_total,
      totalPurchases: totalPurchases.rows[0].purchase_total,
    };
  }
}

module.exports = GeneralService;
