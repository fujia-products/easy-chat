import cluster from 'cluster';
import http from 'http';

export const setupMaster = (
  httpServer: http.Server,
  opts: Record<string, any>
) => {
  if (!cluster.isPrimary) {
    throw new Error('not primary');
  }

  const options = Object.assign(
    {
      loadBalancingMethod: 'least-connection', // either "random", "round-robin" or "least-connection"
    },
    opts
  );

  const sessionIdToWorker = new Map();
  const sidRegex = /sid=([\w-]{20})/;
  let currentIndex = 0; // for round-robin load balancing

  const computeWorkerId = (data: string) => {
    const match = sidRegex.exec(data);

    if (!cluster.workers) return;

    if (match) {
      const sid = match[1];
      const workerId = sessionIdToWorker.get(sid);
      cluster.workers;
      if (workerId && cluster.workers[workerId]) {
        return workerId;
      }
    }
    let leastActiveWorker;
    switch (options.loadBalancingMethod) {
      case 'random': {
        const workerIds = Object.keys(cluster.workers);
        return workerIds[Math.floor(Math.random() * workerIds.length)];
      }
      case 'round-robin': {
        const workerIds = Object.keys(cluster.workers);
        currentIndex++;
        if (currentIndex >= workerIds.length) {
          currentIndex = 0;
        }
        return workerIds[currentIndex];
      }
      case 'least-connection':
        for (const id in cluster.workers) {
          const worker = cluster.workers[id] as any;

          if (!worker?.clientsCount) continue;

          if (leastActiveWorker === undefined) {
            leastActiveWorker = worker;
          } else {
            const c1 = worker.clientsCount || 0;
            const c2 = leastActiveWorker.clientsCount || 0;
            if (c1 < c2) {
              leastActiveWorker = worker;
            }
          }
        }

        return leastActiveWorker.id;
    }
  };

  httpServer.on('connection', (socket) => {
    socket.once('data', (buffer) => {
      socket.pause();
      const data = buffer.toString();
      const workerId: string = computeWorkerId(data);
      if (!cluster.workers) return;

      cluster.workers[workerId]?.send(
        { type: 'sticky:connection', data },
        socket,
        (err) => {
          if (err) {
            socket.destroy();
          }
        }
      );
    });
  });

  cluster.on('message', (worker: any, { type, data }) => {
    switch (type) {
      case 'sticky:connection':
        sessionIdToWorker.set(data, worker.id);
        if (options.loadBalancingMethod === 'least-connection') {
          worker.clientsCount = (worker.clientsCount || 0) + 1;
        }
        break;
      case 'sticky:disconnection':
        sessionIdToWorker.delete(data);
        if (options.loadBalancingMethod === 'least-connection') {
          worker.clientsCount--;
        }
        break;
    }
  });
};

export const setupWorker = (io: any) => {
  if (!cluster.isWorker) {
    throw new Error('not worker');
  }

  process.on('message', ({ type, data }, socket: any) => {
    switch (type) {
      case 'sticky:connection':
        if (!socket) {
          // might happen if the socket is closed during the transfer to the worker
          // see https://nodejs.org/api/child_process.html#child_process_example_sending_a_socket_object
          return;
        }
        io.httpServer.emit('connection', socket); // inject connection
        // republish first chunk
        if (socket._handle.onread.length === 1) {
          socket._handle.onread(Buffer.from(data));
        } else {
          // for Node.js < 12
          socket._handle.onread(1, Buffer.from(data));
        }
        socket.resume();
        break;
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const ignoreError = () => {}; // the next request will fail anyway

  io.engine.on('connection', (socket: any) => {
    (process as any).send(
      { type: 'sticky:connection', data: socket.id },
      ignoreError
    );

    socket.once('close', () => {
      (process as any).send(
        { type: 'sticky:disconnection', data: socket.id },
        ignoreError
      );
    });
  });
};
