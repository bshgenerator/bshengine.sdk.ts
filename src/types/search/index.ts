type CaseInsensitive<T extends string> = T | Uppercase<T>;

export type BshSearch<T = unknown> = {
    entity?: string
    alias?: string
    fields?: keyof T | string[]
    filters?: Filter<T>[]
    groupBy?: GroupBy<T>
    sort?: Sort<T>[]
    pagination?: Pagination
    from?: BshSearch<unknown>
}

export type LogicalOperator = CaseInsensitive<"and" | "or">;
export type ComparisonOperator = CaseInsensitive<
    | "eq" | "ne"
    | "gt" | "gte"
    | "lt" | "lte"
    | "like" | "ilike"
    | "contains" | "icontains"
    | "starts" | "istarts"
    | "in" | "nin"
    | "between"
    | "isnull" | "notnull">;

export type Filter<T = unknown> = {
    operator?: ComparisonOperator | LogicalOperator;
    field?: string | keyof T;
    value?: unknown;
    type?: string;
    filters?: Filter<T>[];
};

export type GroupBy<T = unknown> = {
    fields?: string[] | keyof T[]
    aggregate?: Aggregate<T>[]
}

export type AggregateFunction =
    | "COUNT"
    | "SUM"
    | "AVG"
    | "MIN"
    | "MAX"

export type Aggregate<T = unknown> = {
    function?: AggregateFunction
    field?: string | keyof T
    alias?: string
}

export type Sort<T> = {
    field?: string | keyof T
    direction?: -1 | 1
}

export type Pagination = {
    page?: number
    size?: number
}
