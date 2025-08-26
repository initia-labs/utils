import ky from "ky";

export interface ViewFunctionParams {
  moduleAddress: string;
  moduleName: string;
  functionName: string;
  typeArgs?: string[];
  args?: string[];
}

export interface MoveClient {
  viewFunction: <T = unknown>(params: ViewFunctionParams) => Promise<T>;
}

export const createMoveClient = (restUrl: string): MoveClient => {
  const restClient = ky.create({ prefixUrl: restUrl });

  const viewFunction = async <T = unknown>(
    params: ViewFunctionParams,
  ): Promise<T> => {
    const {
      moduleAddress,
      moduleName,
      functionName,
      typeArgs = [],
      args = [],
    } = params;

    const path = `initia/move/v1/accounts/${moduleAddress}/modules/${moduleName}/view_functions/${functionName}`;
    const payload = { type_args: typeArgs, args };

    const response = await restClient
      .post(path, { json: payload })
      .json<{ data: string; message?: string }>();

    if (response.message) {
      throw new Error(response.message);
    }

    return JSON.parse(response.data) as T;
  };

  return {
    viewFunction,
  };
};
