import { Router } from "express";
import { pool } from "../../db/pool.js";
import { authenticate } from "../../shared/authenticate.js";

export const balancesRouter = Router();

balancesRouter.get("/", authenticate, async (request, response) => {
  const result = await pool.query<{
    asset: string;
    name: string;
    decimals: number;
    availableUnits: string;
  }>(
    `SELECT a.code AS asset, a.name, a.decimals,
            c.balance_units::text AS "availableUnits"
     FROM accounts c
     JOIN assets a ON a.code = c.asset_code
     WHERE c.user_id = $1 AND c.status = 'ACTIVE' AND a.enabled = TRUE
     ORDER BY a.code`,
    [request.userId],
  );

  response.status(200).json({ balances: result.rows });
});
