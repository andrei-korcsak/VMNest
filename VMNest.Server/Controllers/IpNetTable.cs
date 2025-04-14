using System.ComponentModel;
using System.Net;
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

    public (List<MachineModel> Items, int TotalPages) GetIpsAndMacs(int page, int pageSize)
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
                        Type = row.dwType.ToString()
                    });
                }
            }
        }
        finally
        {
            // Release the memory.
            FreeMibTable(buffer);
        }

        // Pagination logic
        int totalItems = result.Count;
        int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var paginatedResult = result
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return (paginatedResult, totalPages);
    }
}
