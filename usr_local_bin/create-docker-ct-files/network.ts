import { jsonRun } from "./run.ts";
import { chooseOne } from "./prompt.ts";

export type NetworkInterfaceType =
  | "bareudp"
  | "bond"
  | "bond_slave"
  | "bridge"
  | "bridge_slave"
  | "dummy"
  | "erspan"
  | "geneve"
  | "gre"
  | "gretap"
  | "ifb"
  | "ip6erspan"
  | "ip6gre"
  | "ip6gretap"
  | "ip6tnl"
  | "ipip"
  | "ipoib"
  | "ipvlan"
  | "ipvtap"
  | "macsec"
  | "macvlan"
  | "macvtap"
  | "netdevsim"
  | "nlmon"
  | "rmnet"
  | "sit"
  | "team_slave"
  | "vcan"
  | "veth"
  | "vlan"
  | "vrf"
  | "vti"
  | "vxcan"
  | "vxlan"
  | "xfrm";

export interface NetworkInterface {
  name: string;
  type: NetworkInterfaceType;
  up: boolean;
  macAddress: string;
}

interface IpResponseRow {
  ifname: string;
  operstate: "UP" | unknown;
  address: string;
  linkinfo: {
    info_kind: NetworkInterfaceType;
  };
}

export type UpStatus = true | undefined;

export async function getNetworkInterface(
  type?: NetworkInterfaceType,
  up: UpStatus = true,
  descriptive = type ? `${type} network interface` : "network interface",
  message = `Pick ${descriptive}.`,
): Promise<NetworkInterface> {
  const choices: NetworkInterface[] = await getNetworkInterfaces(type, up);
  if (choices.length === 0) {
    throw new Error(
      `Could not find any ${up ? "active " : ""}${descriptive}.`,
    );
  }
  const valueProperty = "name";
  const search = true;

  return await chooseOne<NetworkInterface>({
    choices,
    message,
    valueProperty,
    search,
  });
}

function parseIpResponseRow(response: IpResponseRow): NetworkInterface {
  return ({
    name: response.ifname,
    type: response.linkinfo.info_kind,
    up: response.operstate === "UP",
    macAddress: response.address,
  });
}

export async function getNetworkInterfaces(
  type?: NetworkInterfaceType,
  up?: UpStatus,
): Promise<NetworkInterface[]> {
  const ipResponseRows: IpResponseRow[] = await jsonRun<IpResponseRow[]>([
    "ip",
    "-json",
    "-pretty",
    "-details",
    "link",
    "show",
    ...(up ? ["up"] : []),
    ...(type ? ["type", type] : []),
  ]);
  return ipResponseRows.map(parseIpResponseRow);
}
