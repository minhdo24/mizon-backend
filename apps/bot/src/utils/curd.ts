import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import _, { uniq } from "lodash";
import { EntityManager, SelectQueryBuilder } from "typeorm";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";

export abstract class CrudService<Entity> extends TypeOrmCrudService<Entity> {
  public getSelect(query: any, options: any) {
    return uniq(super.getSelect(query, options));
  }

  protected builderSetWhere(
    builder: SelectQueryBuilder<Entity>,
    condition: any,
    field: string,
    value: any,
    operator?: any,
  ) {
    field = this.transformJsonFieldSearch(field);
    return super.builderSetWhere(builder, condition, field, value, operator);
  }

  protected getFieldWithAlias(field: string, sort?: boolean): string {
    const index = field.indexOf("->");
    if (index === -1) return super.getFieldWithAlias(field, sort);
    field = `${super.getFieldWithAlias(field.slice(0, index).replaceAll('"', ""), sort)}->${field.slice(index + 2)}`;
    return field;
  }

  /**
   * direct relations will not be updated
   */
  public updateSession(entity: Entity) {
    const previousState = JSON.parse(JSON.stringify(entity));
    return {
      save: async (entityManager) => {
        const updates: any = {};
        for (const key of _.uniq([...Object.keys(entity), ...Object.keys(previousState)])) {
          if (!_.isEqual((entity as any)[key], previousState[key])) {
            updates[key] = (entity as any)[key];
          }
        }
        delete updates["createdAt"];
        delete updates["updatedAt"];
        await this.updateWhere({ id: (entity as any).id } as any, updates, entityManager);
        /*if ((res.affected || 0) === 0) {
          return this.repo.save(entity); //creating instead of saving
        }*/
        return entity;
      },
    } as { save: (entityManager?: EntityManager) => Promise<Entity> };
  }

  /**
   * direct relations will not be updated
   */
  public async updateWhere(
    condition: FindOptionsWhere<Entity>,
    updates: Omit<Partial<Entity>, "id">,
    entityManager?: EntityManager,
  ) {
    if (entityManager) {
      return entityManager.update(this.entityType, condition, updates as any);
    }
    return this.repo.update(condition, updates as any);
  }

  /**
   * direct relations will not be updated
   */
  public async updateEntry(entity: Entity, updates: Omit<Partial<Entity>, "id">, entityManager?: EntityManager) {
    await this.updateWhere({ id: (entity as any).id } as any, updates, entityManager);
    return Object.assign(entity, updates);
  }

  protected mapOperatorsToQuery(cond: any, param: any): { str: string; params: any } {
    param = param.replaceAll("->>", ".").replaceAll("->", ".").replaceAll(`"`, "").replaceAll(`'`, "");
    return super.mapOperatorsToQuery(cond, param);
  }

  private transformJsonFieldSearch(field: string) {
    const splitField = field.split(".");
    if (splitField.length <= 1) return field;

    const jsonColumn = this.repo.metadata.ownColumns.find(
      (c) => (c.type === "json" || c.type === "jsonb") && c.propertyName === splitField[0],
    );

    if (!jsonColumn) return field;

    let newField = `"${splitField[0]}"`;

    const lastProperty = splitField.pop();

    for (const f of splitField.slice(1)) {
      newField += `->'${f}'`;
    }

    newField += `->>'${lastProperty}'`;

    return newField;
  }

  protected runInTransaction<T>(
    fn: (entityManager: EntityManager) => Promise<T>,
    entityManager?: EntityManager,
  ): Promise<T> {
    if (entityManager) {
      return fn(entityManager);
    } else {
      return this.repo.manager.transaction(fn);
    }
  }
}
