import {
  Any,
  ArrayContainedBy,
  ArrayContains,
  ArrayOverlap,
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export const FILTER_MAPPER = {
  not: Not,
  less_than: LessThan,
  less_than_or_equal: LessThanOrEqual,
  more_than: MoreThan,
  more_than_equal: MoreThanOrEqual,
  equal: Equal,
  any: Any,
  array_contained_by: ArrayContainedBy,
  array_contains: ArrayContains,
  array_overlap: ArrayOverlap,
  between: Between,
  i_like: ILike,
  in: In,
  is_null: IsNull,
  like: Like,
};
