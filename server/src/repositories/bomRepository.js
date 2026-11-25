import { query, withTransaction } from '../config/database.js';

export class BomRepository {
  static async findByProductId(productId) {
    const bomSql = `
      SELECT b.*, p.name as product_name
      FROM erp.boms b
      JOIN erp.products p ON b.product_id = p.id
      WHERE b.product_id = $1 AND b.is_active = TRUE
      LIMIT 1
    `;
    const bomRes = await query(bomSql, [productId]);
    if (bomRes.rows.length === 0) return null;

    const bom = bomRes.rows[0];
    const itemsSql = `
      SELECT id, material_id, material_type, material_name, planned_qty, unit_id, standard_rate
      FROM erp.bom_items
      WHERE bom_id = $1
      ORDER BY id ASC
    `;
    const itemsRes = await query(itemsSql, [bom.id]);

    return {
      ...bom,
      ingredients: itemsRes.rows,
    };
  }

  static async findDefaultMurukkuBom() {
    return this.findByProductId('PROD-001');
  }

  static async updateFormula(productId, { ingredients, standard_labour_cost, standard_power_gas_cost }) {
    return withTransaction(async (client) => {
      const bomRes = await client.query(
        `SELECT id FROM erp.boms WHERE product_id = $1 AND is_active = TRUE LIMIT 1`,
        [productId]
      );

      if (bomRes.rows.length === 0) {
        throw new Error(`BOM not found for product: ${productId}`);
      }
      const bomId = bomRes.rows[0].id;

      if (standard_labour_cost !== undefined || standard_power_gas_cost !== undefined) {
        await client.query(
          `UPDATE erp.boms
           SET standard_labour_cost = COALESCE($1, standard_labour_cost),
               standard_power_gas_cost = COALESCE($2, standard_power_gas_cost),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [standard_labour_cost, standard_power_gas_cost, bomId]
        );
      }

      if (ingredients && Array.isArray(ingredients)) {
        await client.query(`DELETE FROM erp.bom_items WHERE bom_id = $1`, [bomId]);

        for (const item of ingredients) {
          await client.query(
            `INSERT INTO erp.bom_items (bom_id, material_id, material_type, material_name, planned_qty, unit_id, standard_rate)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              bomId,
              item.material_id,
              item.material_type || 'RAW_MATERIAL',
              item.material_name,
              item.planned_qty,
              item.unit_id,
              item.standard_rate || 0,
            ]
          );
        }
      }

      const updated = await client.query(`SELECT * FROM erp.boms WHERE id = $1`, [bomId]);
      const items = await client.query(`SELECT * FROM erp.bom_items WHERE bom_id = $1 ORDER BY id ASC`, [bomId]);
      return {
        ...updated.rows[0],
        ingredients: items.rows,
      };
    });
  }
}
