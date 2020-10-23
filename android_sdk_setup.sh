sudo apt-get install openjdk-11-jdk
udpate-alternatives --list java
mkdir -p /opt/ubuntu/sdkroot/cmdline-tools
cd /opt/ubuntu/sdkroot/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-6609375_latest.zip
unzip commandlinetools-linux-6609375_latest.zip
echo "export ANDROID_SDK_ROOT=/opt/ubuntu/sdkroot/" >> ~/.bashrc
echo "export PATH=$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$PATH" >> ~/.bashrc
sdkmanager ''