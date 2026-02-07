/**
 * Cube.js Semantic Layer Schema
 * Defines metrics and dimensions for decoupled analytics exploration
 */

cube(`Orders`, {
    sql: `SELECT * FROM "Order"`,

    measures: {
        count: {
            type: `count`,
            drillMembers: [id, status, createdAt]
        },
        totalRevenue: {
            sql: `total_amount`,
            type: `sum`,
            format: `currency`
        },
        averageOrderValue: {
            sql: `total_amount`,
            type: `avg`,
            format: `currency`
        },
        completedOrderCount: {
            type: `count`,
            filters: [{ sql: `${CUBE}.status = 'COMPLETED'` }]
        }
    },

    dimensions: {
        id: {
            sql: `id`,
            type: `string`,
            primaryKey: true
        },
        status: {
            sql: `status`,
            type: `string`
        },
        locationId: {
            sql: `location_id`,
            type: `string`
        },
        restaurantId: {
            sql: `restaurant_id`,
            type: `string`
        },
        createdAt: {
            sql: `created_at`,
            type: `time`
        }
    },

    preAggregations: {
        // Caches daily revenue aggregated by location
        main: {
            measures: [CUBE.totalRevenue, CUBE.count],
            dimensions: [CUBE.locationId, CUBE.restaurantId],
            timeDimension: CUBE.createdAt,
            granularity: `day`
        }
    }
});

cube(`Inventory`, {
    sql: `SELECT * FROM "InventoryItem"`,

    measures: {
        itemCount: {
            type: `count`
        }
    },

    dimensions: {
        id: {
            sql: `id`,
            type: `string`,
            primaryKey: true
        },
        name: {
            sql: `name`,
            type: `string`
        },
        locationId: {
            sql: `location_id`,
            type: `string`
        }
    }
});
