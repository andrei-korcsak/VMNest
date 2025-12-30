using System.ComponentModel;
using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Collections;
using VMNest.Server.Models;

namespace VMNest.Server.Controllers;

public partial class IpNetTable
{
    // Define MIB_IPNET_TYPE enum like in Ipmib.h header file included in the Windows SDK released for Windows Vista and later
    enum MIB_IPNET_TYPE
    {
        MIB_IPNET_TYPE_OTHER = 1,
        MIB_IPNET_TYPE_INVALID,
        MIB_IPNET_TYPE_DYNAMIC,
        MIB_IPNET_TYPE_STATIC
    }

    // Define the MIB_IPNETROW structure.
    [StructLayout(LayoutKind.Sequential)]
    struct MIB_IPNETROW
    {
        [MarshalAs(UnmanagedType.U4)]
        public int dwIndex;
        [MarshalAs(UnmanagedType.U4)]
        public int dwPhysAddrLen;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac0;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac1;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac2;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac3;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac4;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac5;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac6;
        [MarshalAs(UnmanagedType.U1)]
        public byte mac7;
        [MarshalAs(UnmanagedType.U4)]
        public int dwAddr;
        [MarshalAs(UnmanagedType.U4)]
        public int dwType;
    }

    // Declare the GetIpNetTable function.
    [DllImport("IpHlpApi.dll")]
    [return: MarshalAs(UnmanagedType.U4)]
    static extern int GetIpNetTable(IntPtr pIpNetTable, [MarshalAs(UnmanagedType.U4)] ref int pdwSize, bool bOrder);

    [LibraryImport("IpHlpApi.dll", SetLastError = true)]
    internal static partial int FreeMibTable(IntPtr plpNetTable);

    // The insufficient buffer error.
    const int ERROR_INSUFFICIENT_BUFFER = 122;

    static string ToHexa(byte aByte) => aByte.ToString("X2");

    /// <summary>
    /// Gets the local machine's IP and MAC address
    /// </summary>
    private MachineModel? GetLocalMachine()
    {
        try
        {
            var networkInterfaces = NetworkInterface.GetAllNetworkInterfaces()
                .Where(ni => ni.OperationalStatus == OperationalStatus.Up &&
                            ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                .OrderByDescending(ni => ni.Speed);

            foreach (var ni in networkInterfaces)
            {
                var ipProperties = ni.GetIPProperties();
                var ipv4Address = ipProperties.UnicastAddresses
                    .FirstOrDefault(addr => addr.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork &&
                                          !System.Net.IPAddress.IsLoopback(addr.Address));

                if (ipv4Address != null)
                {
                    var macAddress = ni.GetPhysicalAddress();
                    var macString = string.Join(":", macAddress.GetAddressBytes().Select(b => b.ToString("X2")));

                    return new MachineModel
                    {
                        Ip = ipv4Address.Address.ToString(),
                        MacAddress = macString,
                        Name = Dns.GetHostName(), // Gets the local machine's hostname
                        Type = "Local",
                        Status = "Running"
                    };
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting local machine info: {ex.Message}");
        }

        return null;
    }

    /// <summary>
    /// Checks if a MAC address belongs to common network infrastructure devices (routers, switches, etc.)
    /// </summary>
    private bool IsNetworkInfrastructureDevice(string macAddress)
    {
        // Common vendor prefixes for routers, switches, APs (first 3 bytes of MAC)
        var infrastructureVendors = new[]
        {
            "00:00:5E", // IANA (often used by routers for VRRP)
            "00:50:56", // VMware virtual network adapters (you may want to keep these for VMs)
            "00:0C:29", // VMware
            "00:05:69", // VMware
            "00:1C:42", // Parallels
            "08:00:27", // VirtualBox
        };

        var macPrefix = string.Join(":", macAddress.Split(':').Take(3));
        return infrastructureVendors.Any(v => macPrefix.Equals(v, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Checks if an IP address is reachable and responds like a computer/VM
    /// </summary>
    private async Task<bool> IsComputerOrVmAsync(string ipAddress, int timeoutMs = 2000)
    {
        try
        {
            // 1. Check if device responds to ping
            using var ping = new Ping();
            var pingReply = await ping.SendPingAsync(ipAddress, timeoutMs);
            
            if (pingReply.Status != IPStatus.Success)
            {
                return false;
            }

            // 2. Check common computer/VM ports
            // Try to connect to common Windows/VM ports
            var computerPorts = new[] { 135, 139, 445, 3389, 5985 }; // RPC, NetBIOS, SMB, RDP, WinRM
            
            foreach (var port in computerPorts)
            {
                if (await IsPortOpenAsync(ipAddress, port, 500))
                {
                    // Found an open port typical of computers/VMs
                    return true;
                }
            }

            // 3. If ping succeeds but no computer ports are open, might be a router/printer
            // You can add additional checks here
            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Checks if a specific port is open on a remote host
    /// </summary>
    private async Task<bool> IsPortOpenAsync(string host, int port, int timeoutMs)
    {
        try
        {
            using var client = new System.Net.Sockets.TcpClient();
            var connectTask = client.ConnectAsync(host, port);
            var timeoutTask = Task.Delay(timeoutMs);
            
            var completedTask = await Task.WhenAny(connectTask, timeoutTask);
            
            if (completedTask == connectTask && client.Connected)
            {
                return true;
            }
            
            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Tries to determine if device is a computer/VM by checking DNS hostname
    /// </summary>
    private async Task<bool> HasComputerLikeHostname(string ipAddress)
    {
        try
        {
            var hostEntry = await Dns.GetHostEntryAsync(ipAddress);
            var hostname = hostEntry.HostName.ToLower();

            // Routers and infrastructure devices often have these patterns
            var infrastructureKeywords = new[] { "router", "gateway", "switch", "ap-", "printer", "scanner" };
            
            foreach (var keyword in infrastructureKeywords)
            {
                if (hostname.Contains(keyword))
                {
                    return false; // This is infrastructure, not a computer
                }
            }

            return true; // Hostname doesn't match infrastructure patterns
        }
        catch
        {
            // If DNS resolution fails, we can't determine from hostname
            return true; // Don't filter out based on this check alone
        }
    }

    public string TryDnsResolve(IPAddress ipAddress)
    {
        string result = string.Empty;

        if (ipAddress is not null && OperatingSystem.IsWindows())
        {
            try
            {
                IPHostEntry hostEntry = Dns.GetHostEntry(ipAddress);
                result = hostEntry.HostName;
            }
            catch
            {
#if DEBUG
                Console.WriteLine($"Non-existent domain for {ipAddress}");
#endif
            }
        }

        return result;
    }

    public async Task<string> TryDnsResolveAsync(IPAddress ipAddress)
    {
        string result = string.Empty;

        if (ipAddress is not null && OperatingSystem.IsWindows())
        {
            try
            {
                IPHostEntry hostEntry = await Dns.GetHostEntryAsync(ipAddress);
                result = hostEntry.HostName;
            }
            catch
            {
#if DEBUG
                Console.WriteLine($"Non-existent domain for {ipAddress}");
#endif
            }
        }

        return result;
    }

    public async IAsyncEnumerable<string> TryDnsResolveAsync(List<MachineModel> machines, int buffer)
    {
        if (machines is null) yield break;

        int noOfMachines = machines.Count;
        if (noOfMachines == 0) yield break;

        int buff = noOfMachines > buffer ? buffer : noOfMachines;

        Queue queue = new Queue(noOfMachines);
        foreach(var machine in machines)
        {
            queue.Enqueue(machine);
        }

        var taskListOfMachine = new List<Task<string>>(buff);

        while(queue.Count > 0)
        {
            while(taskListOfMachine.Count < buff)
            {
                var m = queue.Dequeue() as MachineModel;
                if (m is not null)
                {
                    if(IPAddress.TryParse(m.Ip, out var iPAddress))
                    {
                        taskListOfMachine.Add(TryDnsResolveAsync(iPAddress));
                    }
                }
            }

            var completedTask = await Task.WhenAny(taskListOfMachine);
            taskListOfMachine.Remove(completedTask);

            var dns = await completedTask;

            yield return dns;
        }
    }

    /// <summary>
    /// Gets IPs and MACs from ARP table and verifies they are computers/VMs
    /// Includes the local machine
    /// </summary>
    public async Task<List<MachineModel>> GetIpsAndMacsAsync()
    {
        var allIpsAndMacs = GetIpsAndMacs();
        var verifiedMachines = new List<MachineModel>();

        // Add the local machine first
        var localMachine = GetLocalMachine();
        if (localMachine != null)
        {
            Console.WriteLine($"✓ Added local machine: {localMachine.Ip} ({localMachine.Name})");
            verifiedMachines.Add(localMachine);
        }

        Console.WriteLine($"Found {allIpsAndMacs.Count} remote devices in ARP table. Verifying...");

        // Verify each remote device concurrently
        var verificationTasks = allIpsAndMacs.Select(async machine =>
        {
            // Skip if MAC address indicates network infrastructure
            if (IsNetworkInfrastructureDevice(machine.MacAddress))
            {
#if DEBUG
                Console.WriteLine($"Skipping {machine.Ip} - MAC indicates infrastructure device");
#endif
                return (machine, false);
            }

            // Check if hostname suggests infrastructure device
            var hasComputerHostname = await HasComputerLikeHostname(machine.Ip);
            if (!hasComputerHostname)
            {
#if DEBUG
                Console.WriteLine($"Skipping {machine.Ip} - Hostname indicates infrastructure device");
#endif
                return (machine, false);
            }

            // Check if device responds like a computer/VM
            var isComputer = await IsComputerOrVmAsync(machine.Ip);
            
#if DEBUG
            if (isComputer)
            {
                Console.WriteLine($"✓ Verified {machine.Ip} as computer/VM");
            }
            else
            {
                Console.WriteLine($"✗ Filtered out {machine.Ip} - Not a computer/VM");
            }
#endif
            
            return (machine, isComputer);
        }).ToList();

        var results = await Task.WhenAll(verificationTasks);

        // Only add machines that passed verification
        foreach (var (machine, isValid) in results)
        {
            if (isValid)
            {
                verifiedMachines.Add(machine);
            }
        }

        Console.WriteLine($"Verification complete: {verifiedMachines.Count} computers/VMs found (including local machine)");
        return verifiedMachines;
    }

    public List<MachineModel> GetIpsAndMacs()
    {
        List<MachineModel> result = new List<MachineModel>();

        // The number of bytes needed.
        int bytesNeeded = 0;

        // The ipNetTable from the API call.
        int ipNetTable = GetIpNetTable(IntPtr.Zero, ref bytesNeeded, false);

        // Call the function, expecting an insufficient buffer.
        if (ipNetTable != ERROR_INSUFFICIENT_BUFFER)
        {
            // Throw an exception.
            throw new Win32Exception(ipNetTable);
        }

        // Allocate the memory, do it in a try/finally block, to ensure
        // that it is released.
        IntPtr buffer = IntPtr.Zero;

        try
        {
            // Allocate the memory.
            buffer = Marshal.AllocCoTaskMem(bytesNeeded);

            // Make the call again. If it did not succeed, then
            // raise an error.
            ipNetTable = GetIpNetTable(buffer, ref bytesNeeded, false);

            // If the result is not 0 (no error), then throw an exception.
            if (ipNetTable != 0)
            {
                // Throw an exception.
                throw new Win32Exception(ipNetTable);
            }

            // Now we have the buffer, we have to marshal it. We can read
            // the first 4 bytes to get the length of the buffer.
            int entries = Marshal.ReadInt32(buffer);

            // Increment the memory pointer by the size of the int.
            IntPtr currentBuffer = new IntPtr(buffer.ToInt64() +
                Marshal.SizeOf<int>());

            // Allocate an array of entries.
            MIB_IPNETROW[] table = new MIB_IPNETROW[entries];

            // Cycle through the entries.
            for (int index = 0; index < entries; index++)
            {
                // Call PtrToStructure, getting the structure information.
                var aRow = Marshal.PtrToStructure(new
                    IntPtr(currentBuffer.ToInt64() + (index *
                    Marshal.SizeOf<MIB_IPNETROW>())), typeof(MIB_IPNETROW));

                if (aRow != null)
                {
                    table[index] = (MIB_IPNETROW)aRow;
                }
            }

            for (int index = 0; index < entries; index++)
            {
                MIB_IPNETROW row = table[index];

                if (row.dwType == (int)MIB_IPNET_TYPE.MIB_IPNET_TYPE_DYNAMIC)
                {
                    IPAddress ip = new(BitConverter.GetBytes(row.dwAddr));

                    var mac = new string[6];
                    mac[0] = ToHexa(row.mac0);
                    mac[1] = ToHexa(row.mac1);
                    mac[2] = ToHexa(row.mac2);
                    mac[3] = ToHexa(row.mac3);
                    mac[4] = ToHexa(row.mac4);
                    mac[5] = ToHexa(row.mac5);

                    result.Add(new MachineModel
                    {
                        Ip = new IPAddress(BitConverter.GetBytes(row.dwAddr)).ToString(),
                        MacAddress = string.Join(":", mac),
                        Type = row.dwType.ToString(),
                        Status = "Running"
                    });
                }
            }
        }
        finally
        {
            // Release the memory.
            FreeMibTable(buffer);
        }

        return result;
    }
}
